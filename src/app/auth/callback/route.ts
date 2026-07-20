import { NextResponse } from "next/server";

import { getServerClient } from "@/lib/supabase/server";

// OAuth callback: Supabase redirects here after Google sign-in; we exchange
// the code for a session cookie and send the user back where they started.

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await getServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next.startsWith("/") ? next : "/"}`);
    }
  }
  return NextResponse.redirect(`${origin}/?auth_error=1`);
}
