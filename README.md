# Everything Finance

Finance news from stocks, crypto, macro, and world events in one feed, with
AI summaries in plain English. Learning tools help it stick:
spaced-repetition flashcards, a weekly quiz, a plain-language glossary, and
a daily streak.

The whole thing runs on free tiers (Vercel, Supabase, the Gemini free API,
RSS and the Guardian), with hard guards so a surprise bill can't happen.

## How it works

```
GitHub Actions (free scheduler)
  ├─ hourly  → POST /api/cron/ingest   RSS + Guardian → de-dupe → Gemini
  │                                    summarize/categorize → Postgres
  ├─ daily   → POST /api/cron/recap    3-5 bullet "Today's recap"
  └─ weekly  → POST /api/cron/weekly   flashcards + quiz from the week's news

Next.js app (Vercel) → only ever READS pre-computed rows from Supabase.
The AI is never called on page load, so AI usage scales with article
volume, not traffic.
```

**Cost-safety guards** (see `src/lib/config.ts`):

- Hard per-run cap: max `INGEST_MAX_ARTICLES` (60) new articles per run.
- "Already summarized?" check: URL + normalized-title de-dupe against the DB
  before any AI call; only `pending` rows are ever summarized.
- Daily budget ceiling: Gemini calls counted per ET day in `ai_usage`;
  everything stops at `AI_DAILY_BUDGET` (800) and resumes next day.
- Articles are batched ~8 per Gemini call, paced ~4.5s apart (free tier is
  ~15 requests/min), with exponential backoff on 429s.
- Billing stays disabled on the Google Cloud project. With no card attached,
  the worst case is a paused app, not a bill.

## Local development

```bash
npm install
npm run dev
```

With no env vars, the app runs in **demo mode**: sample articles, recap,
quiz, flashcards, and the full 50-term glossary, with a mock AI adapter.
Sign-in is disabled until Supabase is configured.

## Going live

### 1. Supabase (database + Google sign-in): free, no card

1. Create a project at [supabase.com](https://supabase.com).
2. SQL Editor → paste and run `supabase/schema.sql`.
3. Settings → API: copy the URL, `anon` key, and `service_role` key into
   `.env.local` (see `.env.example`).
4. **Google sign-in:** in [Google Cloud Console](https://console.cloud.google.com)
   create OAuth credentials (APIs & Services → Credentials → OAuth client ID,
   type "Web application"). Add the redirect URL shown under Supabase →
   Authentication → Providers → Google, then paste the client ID/secret there.
   Add your Vercel URL to Authentication → URL Configuration → Redirect URLs
   (e.g. `https://your-app.vercel.app/auth/callback`).

### 2. Gemini API key: free, billing disabled

1. Go to [Google AI Studio](https://aistudio.google.com) → Get API key.
2. Do **not** enable billing on the underlying Google Cloud project. Ever.
3. Put the key in `GEMINI_API_KEY`.

### 3. Guardian API key (optional but recommended): free

Request a developer key at
[open-platform.theguardian.com/access](https://open-platform.theguardian.com/access/)
and set `GUARDIAN_API_KEY`. Adds full-article-text summaries for
business/world coverage.

### 4. Deploy to Vercel

1. Push this repo to GitHub, import it at [vercel.com](https://vercel.com).
2. Add every variable from `.env.example` in Project → Settings →
   Environment Variables (generate `CRON_SECRET` with `openssl rand -hex 24`).
3. Enable **Web Analytics** in the Vercel project (Analytics tab → Enable).

### 5. Seed + schedule

1. In the GitHub repo: Settings → Secrets and variables → Actions → add
   `APP_URL` (your Vercel URL, no trailing slash) and `CRON_SECRET`.
2. The workflow in `.github/workflows/cron.yml` now runs ingestion hourly,
   the recap daily, and flashcards/quiz weekly.
3. Kick things off manually: Actions → "Scheduled jobs" → Run workflow →
   `seed` (loads the glossary), then `ingest`, then `recap`, then `weekly`.

Or from a terminal:

```bash
curl -X POST -H "Authorization: Bearer $CRON_SECRET" "$APP_URL/api/admin/seed"
curl -X POST -H "Authorization: Bearer $CRON_SECRET" "$APP_URL/api/cron/ingest"
curl -X POST -H "Authorization: Bearer $CRON_SECRET" "$APP_URL/api/cron/recap"
curl -X POST -H "Authorization: Bearer $CRON_SECRET" "$APP_URL/api/cron/weekly"
```

## Adding news sources

Edit `src/lib/sources.ts` and add an RSS feed with a name, URL, and category
hint. The next ingestion run picks it up. Guardian sections live in the same
file. Never add NewsAPI.org; its free tier forbids production use.

## Project map

| Path | What it is |
|---|---|
| `src/lib/ingest.ts` | Ingestion pipeline + all safety guards |
| `src/lib/ai/` | AI adapter (Gemini + mock), prompts, daily budget |
| `src/lib/sources.ts` | News source config (edit to add feeds) |
| `src/lib/sm2.ts` | Spaced-repetition scheduling |
| `src/lib/streak.ts` | Daily streak logic (ET day boundary) |
| `src/app/api/cron/*` | Ingest / recap / weekly endpoints (CRON_SECRET) |
| `src/app/api/*` | Quiz, flashcards, streak, glossary endpoints |
| `supabase/schema.sql` | Full schema + RLS policies (run once) |
| `.github/workflows/cron.yml` | Free scheduler |

## Notes

- All "days" (recap, streaks) use US Eastern Time.
- AI summaries come from public headlines/descriptions only; no user data is
  ever sent to the AI. Original articles are always linked, never republished.
- Quota visibility: every cron response reports articles processed and AI
  calls made; the `ai_usage` table holds the per-day totals.
