import { NextResponse } from "next/server";

import { supabaseConfigured } from "@/lib/config";
import { touchStreak } from "@/lib/streak";
import { getServerClient } from "@/lib/supabase/server";

// POST: marks an activity complete for today (used by "Mark recap as read")
// and returns the updated streak.

export const dynamic = "force-dynamic";

export async function POST() {
  if (!supabaseConfigured) {
    return NextResponse.json({ error: "Accounts not configured" }, { status: 503 });
  }

  const db = await getServerClient();
  const {
    data: { user },
  } = await db.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in to track your streak" }, { status: 401 });
  }

  const streak = await touchStreak(db, user.id);
  return NextResponse.json({ ok: true, streak });
}
