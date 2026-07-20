import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Service-role client for server-side jobs (ingestion, cron, seeding).
// Bypasses RLS — never import from client components.

let cached: SupabaseClient | null = null;

export function getAdminClient(): SupabaseClient {
  if (cached) return cached;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "Supabase admin client requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY"
    );
  }
  cached = createClient(url, key, { auth: { persistSession: false } });
  return cached;
}
