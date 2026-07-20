import Parser from "rss-parser";

import { getAI } from "./ai";
import { canSpend, recordSpend } from "./ai/budget";
import type { ArticleInput } from "./ai/types";
import {
  AI_BATCH_SIZE,
  AI_CALL_SPACING_MS,
  INGEST_MAX_AGE_DAYS,
  INGEST_MAX_ARTICLES,
} from "./config";
import { canonicalUrl, titleKey } from "./dedupe";
import { GUARDIAN_SECTIONS, RSS_SOURCES } from "./sources";
import { getAdminClient } from "./supabase/admin";
import type { Category } from "./types";

// The ingestion pipeline (PRD Sections 6, 7, 7a):
//   fetch RSS + Guardian → de-dupe → cap → store pending → AI summarize
//   in batches → mark live. All safety guards live here:
//   - hard per-run cap (INGEST_MAX_ARTICLES)
//   - "already summarized?" check (DB lookup before any AI call)
//   - daily AI budget ceiling (lib/ai/budget)
//   - batch pacing + 429 backoff (lib/ai/gemini)

interface Candidate {
  url: string;
  title: string;
  title_key: string;
  description: string;
  source: string;
  hint: Category;
  published_at: string;
  /** Guardian full text — used for summarization only, never stored. */
  body?: string;
}

export interface IngestStats {
  fetched: number;
  newArticles: number;
  summarized: number;
  aiCalls: number;
  skippedBudget: boolean;
  errors: string[];
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function fetchRss(errors: string[]): Promise<Candidate[]> {
  const parser = new Parser({ timeout: 15000 });
  const results = await Promise.allSettled(
    RSS_SOURCES.map(async (src) => {
      const feed = await parser.parseURL(src.url);
      return (feed.items ?? []).slice(0, 25).map((item): Candidate | null => {
        const link = item.link?.trim();
        const title = item.title?.trim();
        if (!link || !title) return null;
        return {
          url: canonicalUrl(link),
          title,
          title_key: titleKey(title),
          description: (item.contentSnippet || item.content || "")
            .replace(/<[^>]+>/g, " ")
            .replace(/\s+/g, " ")
            .trim()
            .slice(0, 1000),
          source: src.name,
          hint: src.hint,
          published_at: item.isoDate || item.pubDate || new Date().toISOString(),
        };
      });
    })
  );

  const out: Candidate[] = [];
  results.forEach((r, i) => {
    if (r.status === "fulfilled") {
      out.push(...r.value.filter((c): c is Candidate => c !== null));
    } else {
      errors.push(`RSS ${RSS_SOURCES[i].name}: ${r.reason?.message ?? r.reason}`);
    }
  });
  return out;
}

async function fetchGuardian(errors: string[]): Promise<Candidate[]> {
  const key = process.env.GUARDIAN_API_KEY;
  if (!key) return [];

  const out: Candidate[] = [];
  for (const section of GUARDIAN_SECTIONS) {
    try {
      const params = new URLSearchParams({
        section,
        "page-size": "15",
        "order-by": "newest",
        "show-fields": "trailText,bodyText",
        "api-key": key,
      });
      const res = await fetch(
        `https://content.guardianapis.com/search?${params}`
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      for (const item of data?.response?.results ?? []) {
        if (!item.webUrl || !item.webTitle) continue;
        out.push({
          url: canonicalUrl(item.webUrl),
          title: item.webTitle,
          title_key: titleKey(item.webTitle),
          description: (item.fields?.trailText ?? "")
            .replace(/<[^>]+>/g, " ")
            .trim()
            .slice(0, 1000),
          source: "The Guardian",
          hint: section === "business" ? "stocks" : "world",
          published_at: item.webPublicationDate ?? new Date().toISOString(),
          body: item.fields?.bodyText?.slice(0, 4000),
        });
      }
    } catch (e) {
      errors.push(`Guardian ${section}: ${(e as Error).message}`);
    }
  }
  return out;
}

export async function runIngestion(): Promise<IngestStats> {
  const stats: IngestStats = {
    fetched: 0,
    newArticles: 0,
    summarized: 0,
    aiCalls: 0,
    skippedBudget: false,
    errors: [],
  };
  const db = getAdminClient();
  const ai = getAI();

  // 1. Fetch from all sources.
  const [rss, guardian] = await Promise.all([
    fetchRss(stats.errors),
    fetchGuardian(stats.errors),
  ]);
  const cutoff = Date.now() - INGEST_MAX_AGE_DAYS * 86_400_000;
  const fresh = [...guardian, ...rss].filter((c) => {
    const t = new Date(c.published_at).getTime();
    return Number.isFinite(t) && t >= cutoff && t <= Date.now() + 3_600_000;
  });
  stats.fetched = fresh.length;

  // 2. De-dupe within the batch (Guardian first, so full-text wins ties).
  const seenUrls = new Set<string>();
  const seenTitles = new Set<string>();
  const unique = fresh.filter((c) => {
    if (seenUrls.has(c.url) || seenTitles.has(c.title_key)) return false;
    seenUrls.add(c.url);
    seenTitles.add(c.title_key);
    return true;
  });

  // 3. De-dupe against the database ("already summarized?" guard, part 1).
  // Chunks of 20 keep the encoded or= query URL under ~4KB; near 16KB the
  // request dies in the HTTP client (UND_ERR_HEADERS_OVERFLOW).
  const isNew: Candidate[] = [];
  for (let i = 0; i < unique.length; i += 20) {
    const chunk = unique.slice(i, i + 20);
    const { data, error } = await db
      .from("articles")
      .select("url, title_key")
      .or(
        `url.in.(${chunk.map((c) => `"${c.url}"`).join(",")}),title_key.in.(${chunk
          .map((c) => `"${c.title_key}"`)
          .join(",")})`
      );
    if (error) {
      stats.errors.push(`DB dedupe: ${error.message}`);
      return stats; // fail safe: no inserts, no AI calls
    }
    const urls = new Set((data ?? []).map((r) => r.url));
    const titles = new Set((data ?? []).map((r) => r.title_key));
    isNew.push(
      ...chunk.filter((c) => !urls.has(c.url) && !titles.has(c.title_key))
    );
  }

  // 4. Hard per-run cap — never an unbounded loop.
  const capped = isNew.slice(0, INGEST_MAX_ARTICLES);
  stats.newArticles = capped.length;

  if (capped.length > 0) {
    const { error } = await db.from("articles").insert(
      capped.map((c) => ({
        url: c.url,
        title: c.title,
        title_key: c.title_key,
        description: c.description,
        source: c.source,
        hint: c.hint,
        published_at: c.published_at,
        status: "pending",
      }))
    );
    if (error) stats.errors.push(`DB insert: ${error.message}`);
  }

  // Guardian bodies live only in memory for this run — never stored.
  const bodies = new Map(capped.filter((c) => c.body).map((c) => [c.url, c.body!]));

  // 5. Summarize pending articles (includes leftovers from failed runs).
  //    Only rows WITHOUT a summary are selected — guard part 2.
  const { data: pending, error: pendErr } = await db
    .from("articles")
    .select("id, url, title, description, source, hint")
    .eq("status", "pending")
    .lt("attempts", 3)
    .order("published_at", { ascending: false })
    .limit(INGEST_MAX_ARTICLES);
  if (pendErr) {
    stats.errors.push(`DB pending: ${pendErr.message}`);
    return stats;
  }

  const queue = pending ?? [];
  for (let i = 0; i < queue.length; i += AI_BATCH_SIZE) {
    const batch = queue.slice(i, i + AI_BATCH_SIZE);

    // Daily budget ceiling — stop cleanly, resume next run.
    if (!(await canSpend(1))) {
      stats.skippedBudget = true;
      break;
    }
    if (i > 0) await sleep(AI_CALL_SPACING_MS);

    const inputs: ArticleInput[] = batch.map((a) => ({
      id: a.id,
      title: a.title,
      description: a.description ?? "",
      source: a.source,
      hint: a.hint as Category,
      body: bodies.get(a.url),
    }));

    try {
      const results = await ai.summarizeArticles(inputs);
      stats.aiCalls += 1;
      await recordSpend(1);

      const byId = new Map(results.map((r) => [r.id, r]));
      for (const a of batch) {
        const r = byId.get(a.id);
        if (r && r.summary && r.categories.length > 0) {
          await db
            .from("articles")
            .update({ summary: r.summary, categories: r.categories, status: "live" })
            .eq("id", a.id);
          stats.summarized += 1;
        } else {
          await db.rpc("bump_article_attempts", { p_id: a.id });
        }
      }
    } catch (e) {
      stats.aiCalls += 1;
      await recordSpend(1); // count failed calls against the budget too
      stats.errors.push(`AI batch: ${(e as Error).message}`);
      for (const a of batch) {
        await db.rpc("bump_article_attempts", { p_id: a.id });
      }
    }
  }

  console.log(
    `[ingest] fetched=${stats.fetched} new=${stats.newArticles} summarized=${stats.summarized} aiCalls=${stats.aiCalls}${stats.skippedBudget ? " BUDGET-CAPPED" : ""}`,
    stats.errors.length ? stats.errors : ""
  );
  return stats;
}
