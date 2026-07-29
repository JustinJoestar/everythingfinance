export const CATEGORIES = ["stocks", "crypto", "macro", "world"] as const;
export type Category = (typeof CATEGORIES)[number];

export const CATEGORY_LABELS: Record<Category, string> = {
  stocks: "Stocks",
  crypto: "Crypto",
  macro: "Macro",
  world: "World",
};

export interface Article {
  id: string;
  url: string;
  source: string;
  title: string;
  summary: string;
  categories: Category[];
  published_at: string; // ISO
}

export interface Recap {
  recap_date: string; // YYYY-MM-DD (ET)
  bullets: string[];
}

export interface QuizQuestion {
  question: string;
  options: string[]; // 4 options
  answer: number; // index into options
  explanation: string;
}

export interface Quiz {
  id: string;
  // The quiz's ET day. The column kept its name from the weekly era.
  week_start: string; // YYYY-MM-DD (ET)
  questions: QuizQuestion[];
}

/** One archive row: the user's best score on that day's quiz. */
export interface QuizArchiveEntry {
  day: string; // YYYY-MM-DD (ET)
  score: number;
  total: number;
}

/** One archive row: how much of that day's deck the user reviewed. */
export interface FlashcardArchiveEntry {
  day: string; // YYYY-MM-DD (ET)
  reviewed: number;
  total: number;
}

export interface Flashcard {
  id: string;
  // The deck's ET day. The column kept its name from the weekly era.
  week_start: string; // YYYY-MM-DD (ET)
  front: string;
  back: string;
  category: Category;
}

export interface CardProgress {
  card_id: string;
  ease: number;
  interval_days: number;
  reps: number;
  lapses: number;
  due_date: string; // YYYY-MM-DD (ET)
}

export interface GlossaryEntry {
  slug: string;
  term: string;
  definition: string;
  source: "seed" | "ai";
}

export interface Streak {
  current_streak: number;
  longest_streak: number;
  last_activity_date: string | null; // YYYY-MM-DD (ET)
}
