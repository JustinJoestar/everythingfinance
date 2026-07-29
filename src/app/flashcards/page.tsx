import type { Metadata } from "next";

import { ArchiveCard } from "@/components/ArchiveCard";
import { FlashcardDeck } from "@/components/FlashcardDeck";
import { PageHero } from "@/components/ui/page-hero";
import {
  getCardProgress,
  getCurrentFlashcards,
  getFlashcardArchive,
  getSessionUser,
} from "@/lib/data";
import { etDateString } from "@/lib/dates";

export const metadata: Metadata = {
  title: "Flashcards",
  description: "Flashcards generated fresh each day from today's finance news.",
};

export default async function FlashcardsPage() {
  const [cards, user, progress, archive] = await Promise.all([
    getCurrentFlashcards(),
    getSessionUser(),
    getCardProgress(),
    getFlashcardArchive(),
  ]);

  const today = etDateString();
  const signedIn = Boolean(user);

  // Signed in: only cards that are new or due today (SM-2 schedule).
  // Anonymous: the whole deck, nothing saved.
  const due = signedIn
    ? cards.filter((c) => !progress[c.id] || progress[c.id].due_date <= today)
    : cards;

  return (
    <div className="space-y-8">
      <PageHero
        eyebrow="Learn"
        title="Flashcards"
        description="The day's news, turned into a fresh deck of cards. Rate each one and spaced repetition decides when you see it again."
      />

      <div className="mx-auto w-full max-w-2xl space-y-8">
        {cards.length === 0 ? (
          <div className="rounded-2xl border border-edge bg-surface p-12 text-center text-muted">
            <p className="font-serif text-xl font-semibold text-ink">
              No cards yet
            </p>
            <p className="mt-2 text-sm">
              Today&rsquo;s deck is generated each morning from the day&rsquo;s
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

        {user && (
          <ArchiveCard
            title="Your flashcard archive"
            emptyText="No decks reviewed yet. Get through today's cards and the day lands here."
            rows={archive.map((a) => ({
              day: a.day,
              value: `${a.reviewed} of ${a.total} cards`,
            }))}
          />
        )}
      </div>
    </div>
  );
}
