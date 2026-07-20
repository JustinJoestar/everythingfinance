import { NextResponse, type NextRequest } from "next/server";

import { supabaseConfigured } from "@/lib/config";
import { isAuthorizedCron } from "@/lib/cron-auth";
import { GLOSSARY_SEED } from "@/lib/glossary-seed";
import { slugify } from "@/lib/slug";
import { getAdminClient } from "@/lib/supabase/admin";

// One-time setup endpoint: loads the ~50 seed glossary terms into the
// database. Idempotent — existing terms are left untouched.

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  if (!isAuthorizedCron(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!supabaseConfigured) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }

  const db = getAdminClient();
  const rows = GLOSSARY_SEED.map((t) => ({
    slug: slugify(t.term),
    term: t.term,
    definition: t.definition,
    source: "seed",
  }));

  const { error } = await db
    .from("glossary")
    .upsert(rows, { onConflict: "slug", ignoreDuplicates: true });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true, seeded: rows.length });
}

export const GET = POST;
