import { NextResponse, type NextRequest } from "next/server";

import { supabaseConfigured } from "@/lib/config";
import { INITIAL_STATE, review, type Rating, type Sm2State } from "@/lib/sm2";
import { touchStreak } from "@/lib/streak";
import { getServerClient } from "@/lib/supabase/server";

// Records a flashcard review for the signed-in user: applies the SM-2
// schedule and updates their streak. Anonymous reviews stay client-side.

export const dynamic = "force-dynamic";

const RATINGS: Rating[] = ["again", "hard", "good", "easy"];

export async function POST(req: NextRequest) {
  if (!supabaseConfigured) {
    return NextResponse.json({ error: "Accounts not configured" }, { status: 503 });
  }

  const db = await getServerClient();
  const {
    data: { user },
  } = await db.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in to save progress" }, { status: 401 });
  }

  let card_id: string, rating: Rating;
  try {
    const body = await req.json();
    card_id = String(body.card_id);
    rating = body.rating;
    if (!RATINGS.includes(rating)) throw new Error("bad rating");
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { data: existing } = await db
    .from("card_progress")
    .select("ease, interval_days, reps, lapses, due_date")
    .eq("user_id", user.id)
    .eq("card_id", card_id)
    .maybeSingle();

  const next = review((existing as Sm2State) ?? INITIAL_STATE, rating);
  const { error } = await db.from("card_progress").upsert({
    user_id: user.id,
    card_id,
    ...next,
    last_reviewed_at: new Date().toISOString(),
  });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const streak = await touchStreak(db, user.id);
  return NextResponse.json({ ok: true, due_date: next.due_date, streak });
}
