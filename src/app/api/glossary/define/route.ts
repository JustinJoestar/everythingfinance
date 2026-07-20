import { NextResponse, type NextRequest } from "next/server";

import { getAI } from "@/lib/ai";
import { canSpend, recordSpend } from "@/lib/ai/budget";
import { supabaseConfigured } from "@/lib/config";
import { slugify } from "@/lib/slug";
import { getAdminClient } from "@/lib/supabase/admin";

// On-demand glossary definitions: if a term isn't in the glossary yet, the
// AI defines it ONCE and the result is cached permanently (PRD 5.2.3).
// Cheap in-memory rate limiting + the daily AI budget keep this abusable
// endpoint from draining quota.

export const dynamic = "force-dynamic";

const TERM_PATTERN = /^[a-zA-Z0-9][a-zA-Z0-9\s\-&().'/]{1,39}$/;

const ipHits = new Map<string, { count: number; windowStart: number }>();
const RATE_LIMIT = 5; // definitions per IP per 10 minutes
const WINDOW_MS = 10 * 60_000;

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = ipHits.get(ip);
  if (!entry || now - entry.windowStart > WINDOW_MS) {
    ipHits.set(ip, { count: 1, windowStart: now });
    return false;
  }
  entry.count += 1;
  return entry.count > RATE_LIMIT;
}

export async function POST(req: NextRequest) {
  let term: string;
  try {
    const body = await req.json();
    term = String(body.term ?? "").trim();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  if (!TERM_PATTERN.test(term)) {
    return NextResponse.json(
      { error: "Please enter a short term (letters and numbers only)." },
      { status: 400 }
    );
  }
  const slug = slugify(term);

  // Already cached? Return it — no AI call.
  if (supabaseConfigured) {
    const db = getAdminClient();
    const { data: existing } = await db
      .from("glossary")
      .select("slug, term, definition, source")
      .eq("slug", slug)
      .maybeSingle();
    if (existing) return NextResponse.json({ entry: existing, cached: true });
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  if (rateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many lookups — try again in a few minutes." },
      { status: 429 }
    );
  }
  if (!(await canSpend(1))) {
    return NextResponse.json(
      { error: "The AI has hit today's free-tier limit. Try again tomorrow." },
      { status: 503 }
    );
  }

  const result = await getAI().defineTerm(term);
  await recordSpend(1);

  if (!result.relevant || !result.definition) {
    return NextResponse.json(
      { error: `"${term}" doesn't look like a finance term.` },
      { status: 422 }
    );
  }

  const entry = {
    slug,
    term: term.replace(/\b\w/g, (c) => c.toUpperCase()),
    definition: result.definition,
    source: "ai" as const,
  };

  if (supabaseConfigured) {
    const db = getAdminClient();
    const { error } = await db
      .from("glossary")
      .upsert(entry, { onConflict: "slug", ignoreDuplicates: true });
    if (error) console.error("glossary insert:", error.message);
  }

  return NextResponse.json({ entry, cached: false });
}
