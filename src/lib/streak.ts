import type { SupabaseClient } from "@supabase/supabase-js";

import { dayDiff, etDateString } from "./dates";
import type { Streak } from "./types";

/**
 * Records that the user completed an activity today (ET) and updates their
 * streak: consecutive ET days with at least one completed activity.
 * Idempotent — multiple activities on the same day count once.
 */
export async function touchStreak(
  db: SupabaseClient,
  userId: string
): Promise<Streak> {
  const today = etDateString();

  const { data: existing } = await db
    .from("streaks")
    .select("current_streak, longest_streak, last_activity_date")
    .eq("user_id", userId)
    .maybeSingle();

  let current = 1;
  let longest = 1;

  if (existing?.last_activity_date) {
    const gap = dayDiff(today, existing.last_activity_date);
    if (gap === 0) return existing as Streak; // already counted today
    current = gap === 1 ? existing.current_streak + 1 : 1;
    longest = Math.max(existing.longest_streak, current);
  }

  const row = {
    user_id: userId,
    current_streak: current,
    longest_streak: longest,
    last_activity_date: today,
  };
  const { error } = await db.from("streaks").upsert(row);
  if (error) console.error("touchStreak:", error.message);

  return {
    current_streak: current,
    longest_streak: longest,
    last_activity_date: today,
  };
}
