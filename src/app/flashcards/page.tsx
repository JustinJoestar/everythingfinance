import type { Metadata } from "next";

import { FlashcardDeck } from "@/components/FlashcardDeck";
import { PageHero } from "@/components/ui/page-hero";
import { getCardProgress, getCurrentFlashcards, getSessionUser } from "@/lib/data";
import { etDateString } from "@/lib/dates";

export const metadata: Metadata = {
  title: "Flashcards",
  description:
    "Spaced-repetition flashcards generated from this week's finance news.",
};

export default async function FlashcardsPage() {
  const [cards, user, progress] = await Promise.all([
    getCurrentFlashcards(),
    getSessionUser(),
    getCardProgress(),
  ]);

  const today = etDateString();
  const signedIn = Boolean(user);

  // Signed in: only cards that are new or due today (SM-2 schedule).
  // Anonymous: the whole week's deck, nothing saved.
  const due = signedIn
    ? cards.filter((c) => !progress[c.id] || progress[c.id].due_date <= today)
    : cards;

  return (
    <div className="space-y-8">
      <PageHero
        eyebrow="Learn"
        title="Flashcards"
        description="This week's news, turned into a deck of cards. Rate each one and spaced repetition decides when you see it again."
      />

      <div className="mx-auto w-full max-w-2xl">

      {cards.length === 0 ? (
        <div className="rounded-2xl border border-edge bg-surface p-12 text-center text-muted">
          <p className="font-serif text-xl font-semibold text-ink">
            No cards yet
          </p>
          <p className="mt-2 text-sm">
            This week’s deck is generated every Monday from the past week’s
            news. Check back soon.
          </p>
        </div>
      ) : (
        <FlashcardDeck
          dueCards={due}
          totalCards={cards.length}
          signedIn={signedIn}
        />
      )}
      </div>
    </div>
  );
}
