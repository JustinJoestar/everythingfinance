// Central place for environment-driven configuration and safety limits.

export const supabaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export const geminiConfigured = Boolean(process.env.GEMINI_API_KEY);

// ---- Cost-safety limits (Section 7a of the PRD) ----

/** Max NEW articles processed per ingestion run. Never unbounded. */
export const INGEST_MAX_ARTICLES = intEnv("INGEST_MAX_ARTICLES", 60);

/**
 * Max Gemini API calls per ET day. Gemini 2.5 Flash-Lite's free tier allows
 * ~1,000 requests/day; we stop well short of it so recap/weekly/glossary
 * calls always have headroom.
 */
export const AI_DAILY_BUDGET = intEnv("AI_DAILY_BUDGET", 800);

/** Articles bundled into one summarization call (saves daily quota). */
export const AI_BATCH_SIZE = intEnv("AI_BATCH_SIZE", 8);

/** Pause between Gemini calls, ms. Free tier allows ~15 RPM. */
export const AI_CALL_SPACING_MS = intEnv("AI_CALL_SPACING_MS", 4500);

/** Gemini model. Flash-Lite class per the PRD — never Pro. */
export const GEMINI_MODEL =
  process.env.GEMINI_MODEL || "gemini-3.1-flash-lite";

/** Only ingest articles published within this many days. */
export const INGEST_MAX_AGE_DAYS = intEnv("INGEST_MAX_AGE_DAYS", 3);

function intEnv(name: string, fallback: number): number {
  const raw = process.env[name];
  const n = raw ? parseInt(raw, 10) : NaN;
  return Number.isFinite(n) && n > 0 ? n : fallback;
}
