import "server-only";

import { supabaseConfigured } from "./config";
import { GLOSSARY_SEED } from "./glossary-seed";
import {
  MOCK_ARTICLES,
  MOCK_FLASHCARDS,
  MOCK_QUIZ,
  MOCK_RECAP,
} from "./mock-data";
import { getServerClient } from "./supabase/server";
import type {
  Article,
  Category,
  Flashcard,
  FlashcardArchiveEntry,
  GlossaryEntry,
  Quiz,
  QuizArchiveEntry,
  Recap,
  Streak,
} from "./types";

// Read-side data layer. Every function returns pre-computed, cached data
// from the database (or local fixtures when Supabase isn't configured) —
// the AI is NEVER called from here.

export const PAGE_SIZE = 30;

export async function getArticles(opts: {
  category?: Category;
  page?: number;
}): Promise<{ articles: Article[]; hasMore: boolean }> {
  const page = Math.max(1, opts.page ?? 1);

  if (!supabaseConfigured) {
    const all = opts.category
      ? MOCK_ARTICLES.filter((a) => a.categories.includes(opts.category!))
      : MOCK_ARTICLES;
    return { articles: all.slice(0, page * PAGE_SIZE), hasMore: false };
  }

  const limit = page * PAGE_SIZE;
  const db = await getServerClient();
  let query = db
    .from("articles")
    .select("id, url, source, title, summary, categories, published_at")
    .eq("status", "live")
    .order("published_at", { ascending: false })
    .range(0, limit); // one extra row tells us whether more exist

  if (opts.category) query = query.contains("categories", [opts.category]);

  const { data, error } = await query;
  if (error) {
    console.error("getArticles:", error.message);
    return { articles: [], hasMore: false };
  }
  const rows = (data ?? []) as Article[];
  return { articles: rows.slice(0, limit), hasMore: rows.length > limit };
}

/** Latest few live articles per category, for the landing showcase. */
export async function getShowcase(
  perCategory = 4
): Promise<Partial<Record<Category, Article[]>>> {
  const { CATEGORIES } = await import("./types");

  if (!supabaseConfigured) {
    const out: Partial<Record<Category, Article[]>> = {};
    for (const c of CATEGORIES) {
      out[c] = MOCK_ARTICLES.filter((a) => a.categories.includes(c)).slice(
        0,
        perCategory
      );
    }
    return out;
  }

  const db = await getServerClient();
  const results = await Promise.all(
    CATEGORIES.map((c) =>
      db
        .from("articles")
        .select("id, url, source, title, summary, categories, published_at")
        .eq("status", "live")
        .contains("categories", [c])
        .order("published_at", { ascending: false })
        .limit(perCategory)
    )
  );

  const out: Partial<Record<Category, Article[]>> = {};
  CATEGORIES.forEach((c, i) => {
    out[c] = (results[i].data ?? []) as Article[];
  });
  return out;
}

export async function getLatestRecap(): Promise<Recap | null> {
  if (!supabaseConfigured) return MOCK_RECAP;

  const db = await getServerClient();
  const { data } = await db
    .from("recaps")
    .select("recap_date, bullets")
    .order("recap_date", { ascending: false })
    .limit(1)
    .maybeSingle();
  return (data as Recap) ?? null;
}

export async function getCurrentQuiz(): Promise<Quiz | null> {
  if (!supabaseConfigured) return MOCK_QUIZ;

  const db = await getServerClient();
  const { data } = await db
    .from("quizzes")
    .select("id, week_start, questions")
    .order("week_start", { ascending: false })
    .limit(1)
    .maybeSingle();
  return (data as Quiz) ?? null;
}

export async function getCurrentFlashcards(): Promise<Flashcard[]> {
  if (!supabaseConfigured) return MOCK_FLASHCARDS;

  const db = await getServerClient();
  const { data: latest } = await db
    .from("flashcards")
    .select("week_start")
    .order("week_start", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!latest) return [];

  const { data } = await db
    .from("flashcards")
    .select("id, week_start, front, back, category")
    .eq("week_start", latest.week_start);
  return (data as Flashcard[]) ?? [];
}

export async function getGlossary(): Promise<GlossaryEntry[]> {
  if (!supabaseConfigured) {
    return GLOSSARY_SEED.map((t) => ({
      slug: t.term.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      term: t.term,
      definition: t.definition,
      source: "seed" as const,
    })).sort((a, b) => a.term.localeCompare(b.term));
  }

  const db = await getServerClient();
  const { data } = await db
    .from("glossary")
    .select("slug, term, definition, source")
    .order("term");
  return (data as GlossaryEntry[]) ?? [];
}

// ---- Logged-in user data (returns null/empty when not signed in) ----

export async function getSessionUser() {
  if (!supabaseConfigured) return null;
  const db = await getServerClient();
  const {
    data: { user },
  } = await db.auth.getUser();
  return user;
}

export async function getStreak(): Promise<Streak | null> {
  if (!supabaseConfigured) return null;
  const db = await getServerClient();
  const {
    data: { user },
  } = await db.auth.getUser();
  if (!user) return null;

  const { data } = await db
    .from("streaks")
    .select("current_streak, longest_streak, last_activity_date")
    .eq("user_id", user.id)
    .maybeSingle();
  return (data as Streak) ?? { current_streak: 0, longest_streak: 0, last_activity_date: null };
}

/** The signed-in user's completed quizzes, one row per quiz day with the
 *  best score. Newest day first. */
export async function getQuizArchive(): Promise<QuizArchiveEntry[]> {
  if (!supabaseConfigured) return [];
  const db = await getServerClient();
  const {
    data: { user },
  } = await db.auth.getUser();
  if (!user) return [];

  const { data } = await db
    .from("quiz_attempts")
    .select("score, total, created_at, quizzes(week_start)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(120);

  // Best score per quiz day.
  const byDay = new Map<string, QuizArchiveEntry>();
  for (const row of data ?? []) {
    const quiz = row.quizzes as unknown as { week_start: string } | null;
    if (!quiz) continue;
    const existing = byDay.get(quiz.week_start);
    if (!existing || row.score > existing.score) {
      byDay.set(quiz.week_start, {
        day: quiz.week_start,
        score: row.score,
        total: row.total,
      });
    }
  }
  return [...byDay.values()].sort((a, b) => (a.day < b.day ? 1 : -1));
}

/** The signed-in user's flashcard history: for each deck day where they
 *  reviewed at least one card, how many of that day's cards they got
 *  through. Newest day first. */
export async function getFlashcardArchive(): Promise<FlashcardArchiveEntry[]> {
  if (!supabaseConfigured) return [];
  const db = await getServerClient();
  const {
    data: { user },
  } = await db.auth.getUser();
  if (!user) return [];

  const [{ data: progress }, { data: decks }] = await Promise.all([
    db
      .from("card_progress")
      .select("card_id, flashcards(week_start)")
      .eq("user_id", user.id),
    db.from("flashcards").select("week_start"),
  ]);

  const deckSize = new Map<string, number>();
  for (const row of decks ?? []) {
    deckSize.set(row.week_start, (deckSize.get(row.week_start) ?? 0) + 1);
  }

  const reviewed = new Map<string, number>();
  for (const row of progress ?? []) {
    const card = row.flashcards as unknown as { week_start: string } | null;
    if (!card) continue;
    reviewed.set(card.week_start, (reviewed.get(card.week_start) ?? 0) + 1);
  }

  return [...reviewed.entries()]
    .map(([day, count]) => ({
      day,
      reviewed: count,
      total: deckSize.get(day) ?? count,
    }))
    .sort((a, b) => (a.day < b.day ? 1 : -1));
}

/** Card progress rows for the signed-in user, keyed by card id. */
export async function getCardProgress(): Promise<
  Record<string, { due_date: string }>
> {
  if (!supabaseConfigured) return {};
  const db = await getServerClient();
  const {
    data: { user },
  } = await db.auth.getUser();
  if (!user) return {};

  const { data } = await db
    .from("card_progress")
    .select("card_id, due_date")
    .eq("user_id", user.id);

  const map: Record<string, { due_date: string }> = {};
  for (const row of data ?? []) map[row.card_id] = { due_date: row.due_date };
  return map;
}
