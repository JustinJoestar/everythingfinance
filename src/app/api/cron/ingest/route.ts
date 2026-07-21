import { NextResponse, type NextRequest } from "next/server";

import { supabaseConfigured } from "@/lib/config";
import { isAuthorizedCron } from "@/lib/cron-auth";
import { runIngestion } from "@/lib/ingest";

// Scheduled ingestion (every 30 min): fetch news → de-dupe → AI summarize → store.
// Triggered by the GitHub Actions scheduler (see .github/workflows/cron.yml).

export const maxDuration = 300;
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  if (!isAuthorizedCron(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!supabaseConfigured) {
    return NextResponse.json(
      { error: "Supabase is not configured — ingestion needs a database." },
      { status: 503 }
    );
  }

  const stats = await runIngestion();
  return NextResponse.json({ ok: true, ...stats });
}

export const POST = GET;
