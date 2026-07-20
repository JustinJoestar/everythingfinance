import type { NextRequest } from "next/server";

/**
 * Guards the cron/admin endpoints. Requests must carry the CRON_SECRET
 * either as `Authorization: Bearer <secret>` or `?key=<secret>`.
 * In local development with no CRON_SECRET set, access is allowed so the
 * pipeline can be tested by hand.
 */
export function isAuthorizedCron(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return process.env.NODE_ENV !== "production";

  const header = req.headers.get("authorization");
  if (header === `Bearer ${secret}`) return true;
  return req.nextUrl.searchParams.get("key") === secret;
}
