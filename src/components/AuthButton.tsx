"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { getBrowserClient } from "@/lib/supabase/client";

const supabaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export function AuthButton({ userEmail }: { userEmail: string | null }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  if (!supabaseConfigured) {
    return (
      <span
        title="Accounts are enabled once Supabase is configured"
        className="cursor-not-allowed rounded-lg px-3 py-1.5 text-sm font-medium text-faint"
      >
        Sign in
      </span>
    );
  }

  async function signIn() {
    setBusy(true);
    const supabase = getBrowserClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${location.origin}/auth/callback` },
    });
  }

  async function signOut() {
    setBusy(true);
    const supabase = getBrowserClient();
    await supabase.auth.signOut();
    setMenuOpen(false);
    setBusy(false);
    router.refresh();
  }

  if (userEmail) {
    return (
      <div className="relative">
        <button
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Account menu"
          className="grid h-8 w-8 place-items-center rounded-full bg-accent-soft text-sm font-semibold text-accent ring-1 ring-edge transition-shadow hover:ring-faint"
        >
          {userEmail[0]?.toUpperCase() ?? "U"}
        </button>
        {menuOpen && (
          <div className="absolute right-0 top-10 z-50 w-56 rounded-xl border border-edge bg-surface p-2 shadow-lg">
            <p className="truncate px-2 py-1.5 text-xs text-muted">{userEmail}</p>
            <button
              onClick={signOut}
              disabled={busy}
              className="w-full rounded-lg px-2 py-1.5 text-left text-sm font-medium text-ink hover:bg-accent-soft"
            >
              Sign out
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <button
      onClick={signIn}
      disabled={busy}
      className="rounded-lg bg-accent px-3.5 py-1.5 text-sm font-medium text-accent-ink shadow-sm transition-colors hover:bg-accent-strong disabled:opacity-50"
    >
      {busy ? "Signing in" : "Sign in"}
    </button>
  );
}
