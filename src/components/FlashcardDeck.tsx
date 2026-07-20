"use client";

import { track } from "@vercel/analytics";
import { useRouter } from "next/navigation";
import { useState } from "react";

import type { Rating } from "@/lib/sm2";
import type { Flashcard } from "@/lib/types";

import { CategoryTag } from "./CategoryTag";

function CompletionMark() {
  return (
    <span className="mx-auto grid h-11 w-11 place-items-center rounded-full bg-accent-soft text-accent">
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M20 6 9 17l-5-5" />
      </svg>
    </span>
  );
}

const RATING_BUTTONS: { rating: Rating; label: string; className: string }[] = [
  { rating: "again", label: "Again", className: "text-danger border-danger/40 hover:bg-danger/10" },
  { rating: "hard", label: "Hard", className: "text-muted border-edge hover:bg-raised" },
  { rating: "good", label: "Good", className: "text-accent border-accent/40 hover:bg-accent-soft" },
  { rating: "easy", label: "Easy", className: "text-success border-success/40 hover:bg-success/10" },
];

export function FlashcardDeck({
  dueCards,
  totalCards,
  signedIn,
}: {
  dueCards: Flashcard[];
  totalCards: number;
  signedIn: boolean;
}) {
  const router = useRouter();
  const [queue, setQueue] = useState(dueCards);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [reviewed, setReviewed] = useState(0);
  const [saving, setSaving] = useState(false);

  const card = queue[index];
  const finished = index >= queue.length;

  async function rate(rating: Rating) {
    if (!card || saving) return;
    setSaving(true);
    try {
      if (signedIn) {
        await fetch("/api/flashcards/review", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ card_id: card.id, rating }),
        });
      }
      track("activity_completed", { type: "flashcard", rating });
      setReviewed((n) => n + 1);
      setFlipped(false);
      // A failed card goes to the back of today's queue.
      if (rating === "again") setQueue((q) => [...q, card]);
      setIndex((i) => i + 1);
    } finally {
      setSaving(false);
    }
  }

  if (queue.length === 0) {
    return (
      <div className="rounded-xl border border-edge bg-surface p-10 text-center">
        <CompletionMark />
        <p className="mt-3 font-serif text-lg font-semibold">All caught up</p>
        <p className="mt-1 text-sm text-muted">
          No cards are due today. Spaced repetition will bring them back right
          when you’re about to forget them.
        </p>
      </div>
    );
  }

  if (finished) {
    return (
      <div className="rounded-xl border border-edge bg-surface p-10 text-center">
        <CompletionMark />
        <p className="mt-3 font-serif text-lg font-semibold">
          Session complete
        </p>
        <p className="mt-1 text-sm text-muted">
          You reviewed {reviewed} card{reviewed === 1 ? "" : "s"}.
          {signedIn
            ? " Your schedule is saved. Come back tomorrow to keep the streak going."
            : " Sign in to save your progress and build a streak."}
        </p>
        <button
          onClick={() => {
            setIndex(0);
            setReviewed(0);
            setFlipped(false);
            if (signedIn) router.refresh();
          }}
          className="mt-4 rounded-lg border border-edge px-4 py-2 text-sm font-medium text-accent shadow-sm transition-colors hover:bg-raised"
        >
          Review again
        </button>
      </div>
    );
  }

  const progress = (Math.min(index, queue.length) / queue.length) * 100;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between font-mono text-[13px] text-muted">
        <span>
          Card {Math.min(index + 1, queue.length)} of {queue.length}
          {signedIn && ` · ${totalCards} in this week’s deck`}
        </span>
        {!signedIn && <span className="text-xs">Sign in to save progress</span>}
      </div>

      <div className="h-1 w-full overflow-hidden rounded-full bg-edge" aria-hidden>
        <div
          className="h-full rounded-full bg-accent transition-[width] duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div
        className="flip-scene cursor-pointer select-none"
        onClick={() => setFlipped((f) => !f)}
        role="button"
        aria-label={flipped ? "Show question" : "Show answer"}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === " " || e.key === "Enter") {
            e.preventDefault();
            setFlipped((f) => !f);
          }
        }}
      >
        <div
          className={`flip-card relative min-h-64 ${flipped ? "flipped" : ""}`}
        >
          <div className="flip-face absolute inset-0 flex flex-col rounded-xl border border-edge bg-surface p-6 shadow-sm">
            <div className="self-start">
              <CategoryTag category={card.category} />
            </div>
            <p className="flex flex-1 items-center justify-center px-2 text-center font-serif text-xl font-semibold leading-snug">
              {card.front}
            </p>
            <p className="text-center font-mono text-xs text-faint">
              Tap to reveal
            </p>
          </div>
          <div className="flip-face flip-back absolute inset-0 flex flex-col rounded-xl border border-accent/30 bg-accent-soft p-6 shadow-sm">
            <div className="self-start">
              <CategoryTag category={card.category} />
            </div>
            <p className="flex flex-1 items-center justify-center px-2 text-center text-[15px] leading-relaxed">
              {card.back}
            </p>
            <p className="text-center text-xs text-faint">
              How well did you know it?
            </p>
          </div>
        </div>
      </div>

      {flipped ? (
        <div className="grid grid-cols-4 gap-2">
          {RATING_BUTTONS.map(({ rating, label, className }) => (
            <button
              key={rating}
              onClick={() => rate(rating)}
              disabled={saving}
              className={`rounded-lg border bg-surface px-2 py-2.5 text-sm font-medium transition-colors disabled:opacity-50 ${className}`}
            >
              {label}
            </button>
          ))}
        </div>
      ) : (
        <button
          onClick={() => setFlipped(true)}
          className="w-full rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-accent-ink shadow-sm transition-colors hover:bg-accent-strong"
        >
          Show answer
        </button>
      )}
    </div>
  );
}
