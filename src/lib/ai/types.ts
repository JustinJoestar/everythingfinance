import type { Category, QuizQuestion } from "../types";

// Thin adapter interface so the AI provider can be swapped (or upgraded to
// a paid tier) without touching the rest of the app.

export interface ArticleInput {
  id: string;
  title: string;
  description: string;
  source: string;
  hint?: Category;
  /** Full article body when available (Guardian). Truncated before sending. */
  body?: string;
}

export interface SummaryResult {
  id: string;
  /** false when the story is not real finance/markets/economy news. */
  relevant: boolean;
  summary: string;
  categories: Category[];
  /** Short note on the category choice or the reason for rejection. */
  reason: string;
}

export interface DigestItem {
  title: string;
  summary: string;
  categories: Category[];
}

export interface FlashcardDraft {
  front: string;
  back: string;
  category: Category;
}

export interface Definition {
  /** false when the term isn't finance-related (we don't cache those). */
  relevant: boolean;
  definition: string;
}

export interface AIAdapter {
  name: string;
  /** Summarize + categorize a batch of articles in a single API call. */
  summarizeArticles(articles: ArticleInput[]): Promise<SummaryResult[]>;
  generateRecap(items: DigestItem[]): Promise<string[]>;
  generateFlashcards(items: DigestItem[]): Promise<FlashcardDraft[]>;
  generateQuiz(items: DigestItem[]): Promise<QuizQuestion[]>;
  defineTerm(term: string): Promise<Definition>;
}
