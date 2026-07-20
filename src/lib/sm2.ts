// Simplified SM-2 spaced-repetition scheduling for flashcards.
// Ratings map to SM-2 quality scores: again=1, hard=3, good=4, easy=5.

import { etDateString, etDaysAgo } from "./dates";

export type Rating = "again" | "hard" | "good" | "easy";

const QUALITY: Record<Rating, number> = { again: 1, hard: 3, good: 4, easy: 5 };

export interface Sm2State {
  ease: number;
  interval_days: number;
  reps: number;
  lapses: number;
  due_date: string; // YYYY-MM-DD (ET)
}

export const INITIAL_STATE: Sm2State = {
  ease: 2.5,
  interval_days: 0,
  reps: 0,
  lapses: 0,
  due_date: etDateString(),
};

export function review(state: Sm2State, rating: Rating): Sm2State {
  const q = QUALITY[rating];
  let { ease, interval_days, reps, lapses } = state;

  if (q < 3) {
    // Failed — relearn from the start, but keep the (reduced) ease.
    reps = 0;
    lapses += 1;
    interval_days = 1;
  } else {
    reps += 1;
    if (reps === 1) interval_days = 1;
    else if (reps === 2) interval_days = 6;
    else interval_days = Math.round(interval_days * ease);
  }

  ease = Math.max(1.3, ease + 0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
  interval_days = Math.min(interval_days, 365);

  // due = today + interval (etDaysAgo with a negative offset walks forward)
  const due_date = etDaysAgo(-interval_days);
  return { ease, interval_days, reps, lapses, due_date };
}
