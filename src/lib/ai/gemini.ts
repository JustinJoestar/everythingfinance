import { GEMINI_MODEL } from "../config";
import { CATEGORIES, type Category, type QuizQuestion } from "../types";
import type {
  AIAdapter,
  ArticleInput,
  Definition,
  DigestItem,
  FlashcardDraft,
  SummaryResult,
} from "./types";

// Google Gemini adapter (free AI Studio tier, billing disabled).
// All calls request JSON output and retry on 429 with exponential backoff.

const API_BASE = "https://generativelanguage.googleapis.com/v1beta/models";
const BACKOFF_MS = [1000, 2000, 4000, 8000];

const AUDIENCE =
  "Write for a general audience with zero finance background. Plain English. If a technical term is unavoidable, explain it in a few words. Be factual and neutral, and never give investment advice. Write like a careful human editor, not a chatbot: use simple verbs (is, are, has), active voice, and short sentences. Never use em dashes or en dashes; use commas, colons, or periods instead. Avoid hype words (crucial, pivotal, vibrant, landscape, testament, underscores, highlights, showcases), filler openers (it is important to note), and tacked-on -ing phrases at the ends of sentences.";

async function callGemini(prompt: string): Promise<string> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY is not set");

  const url = `${API_BASE}/${GEMINI_MODEL}:generateContent`;
  const body = JSON.stringify({
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.4,
    },
  });

  let lastError: Error = new Error("Gemini call failed");
  for (let attempt = 0; attempt <= BACKOFF_MS.length; attempt++) {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": key },
      body,
    });

    if (res.status === 429 || res.status >= 500) {
      lastError = new Error(`Gemini HTTP ${res.status}`);
      if (attempt < BACKOFF_MS.length) {
        await new Promise((r) => setTimeout(r, BACKOFF_MS[attempt]));
        continue;
      }
      throw lastError;
    }
    if (!res.ok) {
      throw new Error(`Gemini HTTP ${res.status}: ${await res.text()}`);
    }

    const data = await res.json();
    const text: string | undefined =
      data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error("Gemini returned an empty response");
    return text;
  }
  throw lastError;
}

function parseJson<T>(raw: string): T {
  // JSON mode should return clean JSON, but strip code fences defensively.
  const cleaned = raw.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "");
  return JSON.parse(cleaned) as T;
}

function isCategory(c: unknown): c is Category {
  return typeof c === "string" && (CATEGORIES as readonly string[]).includes(c);
}

function digestText(items: DigestItem[], max = 60): string {
  return items
    .slice(0, max)
    .map((a, i) => `${i + 1}. [${a.categories.join(", ")}] ${a.title}: ${a.summary}`)
    .join("\n");
}

export const geminiAdapter: AIAdapter = {
  name: "gemini",

  async summarizeArticles(articles: ArticleInput[]): Promise<SummaryResult[]> {
    const list = articles
      .map((a) => {
        const body = a.body ? `\nBody (excerpt): ${a.body.slice(0, 2500)}` : "";
        return `---\nid: ${a.id}\nSource: ${a.source}\nHeadline: ${a.title}\nDescription: ${a.description.slice(0, 600)}${body}`;
      })
      .join("\n");

    const prompt = `You screen and summarize finance news for "Everything Finance". ${AUDIENCE}

The site covers four topics only:
- "stocks": public companies, their shares, earnings, deals, and stock markets.
- "crypto": cryptocurrencies, tokens, exchanges, and blockchain finance.
- "macro": interest rates, inflation, jobs, GDP, and central banks.
- "world": geopolitics, energy, trade, and government policy that moves markets.

For EACH article, first decide if it truly belongs on this site. Set "relevant": false when the story is not really about markets, investing, or the economy, even when it comes from a business section. Reject consumer or lifestyle trends, personal money anecdotes, product reviews, how-to and career pieces, celebrity, sports, and general "business of X" features that do not touch a company's finances, markets, crypto, macro data, or market-moving policy. When unsure, reject.

For each RELEVANT article: write a 2-3 sentence plain-English summary of what happened and why it matters, assign 1-2 categories from the list above, and give a short "reason" (one clause) for the main category. Do not force a category: if nothing fits, the article is not relevant.
For each IRRELEVANT article: set "relevant": false, "summary": "", "categories": [], and a short "reason" for the rejection.

Return ONLY a JSON array, one object per article, shaped like:
[{"id": "<the id given>", "relevant": true, "summary": "...", "categories": ["stocks"], "reason": "..."}]

Articles:
${list}`;

    const raw = await callGemini(prompt);
    const parsed = parseJson<
      {
        id: string;
        relevant?: boolean;
        summary?: string;
        categories?: unknown[];
        reason?: string;
      }[]
    >(raw);
    if (!Array.isArray(parsed)) throw new Error("Expected a JSON array");

    return parsed
      .filter((p) => p && typeof p.id === "string")
      .map((p) => ({
        id: p.id,
        relevant: p.relevant !== false,
        summary: typeof p.summary === "string" ? p.summary.trim() : "",
        categories: (Array.isArray(p.categories)
          ? p.categories.filter(isCategory)
          : []) as Category[],
        reason: typeof p.reason === "string" ? p.reason.trim() : "",
      }));
  },

  async generateRecap(items: DigestItem[]): Promise<string[]> {
    const prompt = `You write a daily digest for "Everything Finance". ${AUDIENCE}

From today's finance news below, write 3-5 bullets covering the MOST important events across stocks, crypto, macro, and world events. Each bullet: 1-2 sentences, self-contained, plain English.

Return ONLY a JSON array of strings: ["bullet one", "bullet two"]

Today's news:
${digestText(items)}`;

    const parsed = parseJson<unknown[]>(await callGemini(prompt));
    const bullets = parsed.filter((b): b is string => typeof b === "string");
    if (bullets.length === 0) throw new Error("Recap came back empty");
    return bullets.slice(0, 5);
  },

  async generateFlashcards(items: DigestItem[]): Promise<FlashcardDraft[]> {
    const prompt = `You create learning flashcards for "Everything Finance". ${AUDIENCE}

From this week's finance news below, create 12 flashcards that teach the concepts and events a beginner should retain. Front: a short question or concept name. Back: a plain-English explanation in 1-3 sentences, understandable by a 15-year-old. Mix concept cards (e.g. "What is a rate cut?") with event cards (e.g. "What did the Fed do this week?"). Assign each card one category from: "stocks", "crypto", "macro", "world".

Return ONLY a JSON array: [{"front": "...", "back": "...", "category": "macro"}]

This week's news:
${digestText(items)}`;

    const parsed = parseJson<
      { front: string; back: string; category: unknown }[]
    >(await callGemini(prompt));
    return parsed
      .filter((c) => c && typeof c.front === "string" && typeof c.back === "string")
      .map((c) => ({
        front: c.front.trim(),
        back: c.back.trim(),
        category: isCategory(c.category) ? c.category : "macro",
      }))
      .slice(0, 16);
  },

  async generateQuiz(items: DigestItem[]): Promise<QuizQuestion[]> {
    const prompt = `You create a weekly news quiz for "Everything Finance". ${AUDIENCE}

From this week's finance news below, write 7 multiple-choice questions testing understanding of what happened and why it matters. Each question has exactly 4 options and one correct answer. Include a 1-2 sentence plain-English explanation of the correct answer. Vary difficulty; no trick questions.

Return ONLY a JSON array:
[{"question": "...", "options": ["A", "B", "C", "D"], "answer": 0, "explanation": "..."}]
("answer" is the zero-based index of the correct option.)

This week's news:
${digestText(items)}`;

    const parsed = parseJson<QuizQuestion[]>(await callGemini(prompt));
    return parsed
      .filter(
        (q) =>
          q &&
          typeof q.question === "string" &&
          Array.isArray(q.options) &&
          q.options.length === 4 &&
          typeof q.answer === "number" &&
          q.answer >= 0 &&
          q.answer < 4
      )
      .slice(0, 8);
  },

  async defineTerm(term: string): Promise<Definition> {
    const prompt = `You write glossary entries for "Everything Finance", a finance-news site for beginners. ${AUDIENCE}

Term: "${term}"

If this is a real finance/economics/markets term, define it in 2-4 sentences a 15-year-old would understand, with a tiny concrete example if it helps. If it is NOT a finance-related term, mark it irrelevant.

Return ONLY JSON: {"relevant": true, "definition": "..."} or {"relevant": false, "definition": ""}`;

    const parsed = parseJson<Definition>(await callGemini(prompt));
    return {
      relevant: Boolean(parsed.relevant),
      definition: typeof parsed.definition === "string" ? parsed.definition.trim() : "",
    };
  },
};
