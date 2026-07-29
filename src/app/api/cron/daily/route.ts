import { NextResponse, type NextRequest } from "next/server";

import { getAI } from "@/lib/ai";
import { canSpend, recordSpend } from "@/lib/ai/budget";
import type { DigestItem } from "@/lib/ai/types";
import { AI_CALL_SPACING_MS, supabaseConfigured } from "@/lib/config";
import { isAuthorizedCron } from "@/lib/cron-auth";
import { etDateString } from "@/lib/dates";
import { getAdminClient } from "@/lib/supabase/admin";

// Daily learning job: generate today's flashcards and quiz from the last
// day of news — once per ET day, then cached. The `week_start` column
// kept its name from the weekly era but now holds the ET day, so each
// day gets its own deck and quiz and past days form the archive.

export const maxDuration = 120;
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  if (!isAuthorizedCron(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!supabaseConfigured) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }

  const db = getAdminClient();
  const ai = getAI();
  const day = etDateString();
  const force = req.nextUrl.searchParams.get("force") === "1";
  const result: Record<string, unknown> = { ok: true, day };

  // 26 hours, like the recap: a full ET day plus slack for late feeds.
  const since = new Date(Date.now() - 26 * 3_600_000).toISOString();
  const { data: articles } = await db
    .from("articles")
    .select("title, summary, categories")
    .eq("status", "live")
    .gte("published_at", since)
    .order("published_at", { ascending: false })
    .limit(40);

  if (!articles || articles.length < 4) {
    return NextResponse.json({ ok: true, skipped: "not enough articles today" });
  }
  const digest = articles as DigestItem[];

  // --- Flashcards ---
  const { data: existingCards } = await db
    .from("flashcards")
    .select("id")
    .eq("week_start", day)
    .limit(1);
  if (force || !existingCards?.length) {
    if (await canSpend(1)) {
      const cards = await ai.generateFlashcards(digest);
      await recordSpend(1);
      if (cards.length > 0) {
        if (force) await db.from("flashcards").delete().eq("week_start", day);
        const { error } = await db
          .from("flashcards")
          .insert(cards.map((c) => ({ ...c, week_start: day })));
        result.flashcards = error ? `error: ${error.message}` : cards.length;
      }
    } else {
      result.flashcards = "skipped: budget";
    }
  } else {
    result.flashcards = "already exists";
  }

  await new Promise((r) => setTimeout(r, AI_CALL_SPACING_MS));

  // --- Quiz ---
  const { data: existingQuiz } = await db
    .from("quizzes")
    .select("id")
    .eq("week_start", day)
    .maybeSingle();
  if (force || !existingQuiz) {
    if (await canSpend(1)) {
      const questions = await ai.generateQuiz(digest);
      await recordSpend(1);
      if (questions.length >= 4) {
        const { error } = await db
          .from("quizzes")
          .upsert({ week_start: day, questions }, { onConflict: "week_start" });
        result.quiz = error ? `error: ${error.message}` : questions.length;
      } else {
        result.quiz = "error: too few valid questions";
      }
    } else {
      result.quiz = "skipped: budget";
    }
  } else {
    result.quiz = "already exists";
  }

  console.log("[daily]", result);
  return NextResponse.json(result);
}

export const POST = GET;
