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
  week_start: string; // YYYY-MM-DD (ET Monday)
  questions: QuizQuestion[];
}

export interface QuizAttempt {
  quiz_id: string;
  score: number;
  total: number;
  created_at: string;
}

export interface Flashcard {
  id: string;
  week_start: string;
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
