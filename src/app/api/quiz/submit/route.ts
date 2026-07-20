import { NextResponse, type NextRequest } from "next/server";

import { supabaseConfigured } from "@/lib/config";
import { touchStreak } from "@/lib/streak";
import { getServerClient } from "@/lib/supabase/server";

// Records a quiz attempt for the signed-in user and updates their streak.
// Anonymous users can still take the quiz — the client just doesn't call
// this endpoint for them.

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  if (!supabaseConfigured) {
    return NextResponse.json({ error: "Accounts not configured" }, { status: 503 });
  }

  const db = await getServerClient();
  const {
    data: { user },
  } = await db.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in to save your score" }, { status: 401 });
  }

  let quiz_id: string, score: number, total: number;
  try {
    const body = await req.json();
    quiz_id = String(body.quiz_id);
    score = Number(body.score);
    total = Number(body.total);
    if (!Number.isInteger(score) || !Number.isInteger(total) || score < 0 || score > total || total < 1 || total > 20) {
      throw new Error("bad score");
    }
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { error } = await db
    .from("quiz_attempts")
    .insert({ user_id: user.id, quiz_id, score, total });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const streak = await touchStreak(db, user.id);
  return NextResponse.json({ ok: true, streak });
}
