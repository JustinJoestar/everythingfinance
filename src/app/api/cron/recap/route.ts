import { NextResponse, type NextRequest } from "next/server";

import { getAI } from "@/lib/ai";
import { canSpend, recordSpend } from "@/lib/ai/budget";
import type { DigestItem } from "@/lib/ai/types";
import { supabaseConfigured } from "@/lib/config";
import { isAuthorizedCron } from "@/lib/cron-auth";
import { etDateString } from "@/lib/dates";
import { getAdminClient } from "@/lib/supabase/admin";

// Daily job: generate "Today's recap" — a 3-5 bullet digest of the last
// 24 hours — exactly once per ET day, then cache it.

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
  const today = etDateString();
  const force = req.nextUrl.searchParams.get("force") === "1";

  if (!force) {
    const { data: existing } = await db
      .from("recaps")
      .select("recap_date")
      .eq("recap_date", today)
      .maybeSingle();
    if (existing) {
      return NextResponse.json({ ok: true, skipped: "already generated today" });
    }
  }

  const since = new Date(Date.now() - 26 * 3_600_000).toISOString();
  const { data: articles } = await db
    .from("articles")
    .select("title, summary, categories")
    .eq("status", "live")
    .gte("published_at", since)
    .order("published_at", { ascending: false })
    .limit(40);

  if (!articles || articles.length < 3) {
    return NextResponse.json({ ok: true, skipped: "not enough fresh articles" });
  }
  if (!(await canSpend(1))) {
    return NextResponse.json({ ok: false, skipped: "daily AI budget reached" });
  }

  const bullets = await getAI().generateRecap(articles as DigestItem[]);
  await recordSpend(1);

  const { error } = await db
    .from("recaps")
    .upsert({ recap_date: today, bullets });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  console.log(`[recap] generated ${bullets.length} bullets for ${today}`);
  return NextResponse.json({ ok: true, recap_date: today, bullets });
}

export const POST = GET;
