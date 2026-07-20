import type { QuizQuestion } from "../types";
import type {
  AIAdapter,
  ArticleInput,
  Definition,
  DigestItem,
  FlashcardDraft,
  SummaryResult,
} from "./types";

// Deterministic mock adapter used when GEMINI_API_KEY is not set, so the
// whole app runs locally with zero external services. Never used once a
// real key is configured.

function firstSentences(text: string, n = 2): string {
  const clean = text.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
  const parts = clean.match(/[^.!?]+[.!?]+/g) ?? [clean];
  return parts.slice(0, n).join(" ").trim();
}

export const mockAdapter: AIAdapter = {
  name: "mock",

  async summarizeArticles(articles: ArticleInput[]): Promise<SummaryResult[]> {
    return articles.map((a) => ({
      id: a.id,
      summary:
        firstSentences(a.description || a.title) +
        " (Sample summary — connect a Gemini API key for real AI summaries.)",
      categories: [a.hint ?? "stocks"],
    }));
  },

  async generateRecap(items: DigestItem[]): Promise<string[]> {
    return items
      .slice(0, 4)
      .map((i) => `${i.title} — ${firstSentences(i.summary, 1)}`);
  },

  async generateFlashcards(items: DigestItem[]): Promise<FlashcardDraft[]> {
    return items.slice(0, 10).map((i) => ({
      front: `What happened: ${i.title}?`,
      back: firstSentences(i.summary, 2),
      category: i.categories[0] ?? "macro",
    }));
  },

  async generateQuiz(items: DigestItem[]): Promise<QuizQuestion[]> {
    return items.slice(0, 5).map((i) => ({
      question: `Which of these happened this week? (sample question)`,
      options: [i.title, "None of the above", "Markets were closed all week", "It has not been reported"],
      answer: 0,
      explanation: firstSentences(i.summary, 1),
    }));
  },

  async defineTerm(term: string): Promise<Definition> {
    return {
      relevant: true,
      definition: `Sample definition for "${term}". Connect a Gemini API key to generate real plain-English definitions on demand.`,
    };
  },
};
