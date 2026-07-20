import { AI_DAILY_BUDGET, supabaseConfigured } from "../config";
import { etDateString } from "../dates";
import { getAdminClient } from "../supabase/admin";

// Daily AI-call budget (Section 7a). Every Gemini call is counted against
// an ET-day row in `ai_usage`; once the ceiling is hit, callers stop until
// the next day. In mock/local mode this is tracked in memory.

const memory = new Map<string, number>();

export async function getUsageToday(): Promise<number> {
  const today = etDateString();
  if (!supabaseConfigured) return memory.get(today) ?? 0;

  const db = getAdminClient();
  const { data } = await db
    .from("ai_usage")
    .select("calls")
    .eq("usage_date", today)
    .maybeSingle();
  return data?.calls ?? 0;
}

export async function canSpend(calls = 1): Promise<boolean> {
  return (await getUsageToday()) + calls <= AI_DAILY_BUDGET;
}

export async function recordSpend(calls = 1): Promise<void> {
  const today = etDateString();
  if (!supabaseConfigured) {
    memory.set(today, (memory.get(today) ?? 0) + calls);
    return;
  }

  const db = getAdminClient();
  // Atomic upsert-increment via RPC (defined in schema.sql).
  const { error } = await db.rpc("increment_ai_usage", {
    p_date: today,
    p_calls: calls,
  });
  if (error) console.error("Failed to record AI usage:", error.message);
}
