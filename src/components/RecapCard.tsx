"use client";

import { track } from "@vercel/analytics";
import { useRouter } from "next/navigation";
import { useState } from "react";

import type { Recap } from "@/lib/types";

import { LedgerRule } from "./ui/ledger-rule";

export function RecapCard({
  recap,
  heading,
  signedIn,
  alreadyDoneToday,
}: {
  recap: Recap;
  heading: string;
  signedIn: boolean;
  alreadyDoneToday: boolean;
}) {
  const router = useRouter();
  const [done, setDone] = useState(alreadyDoneToday);
  const [busy, setBusy] = useState(false);

  async function markRead() {
    setBusy(true);
    try {
      const res = await fetch("/api/streak", { method: "POST" });
      if (res.ok) {
        setDone(true);
        track("activity_completed", { type: "recap" });
        router.refresh(); // updates the header streak counter
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <section
      id="todays-recap"
      aria-label="Today's recap"
      className="scroll-mt-28 rounded-xl border border-edge bg-surface p-6 shadow-sm"
    >
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="font-serif text-lg font-semibold">Today’s recap</h2>
        <span className="font-mono text-xs font-medium uppercase tracking-[0.12em] text-faint">
          {heading}
        </span>
      </div>
      <LedgerRule className="mt-3 w-14" delay={0.15} />

      <ul className="mt-4 space-y-3">
        {recap.bullets.map((b, i) => (
          <li key={i} className="flex gap-3 text-[15px] leading-relaxed">
            <span
              className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full bg-accent"
              aria-hidden
            />
            <span>{b}</span>
          </li>
        ))}
      </ul>

      {signedIn && (
        <button
          onClick={markRead}
          disabled={done || busy}
          className={`mt-5 rounded-lg border px-3.5 py-2 text-sm font-medium transition-colors ${
            done
              ? "cursor-default border-edge text-faint"
              : "border-edge text-accent shadow-sm hover:bg-raised"
          }`}
        >
          {done
            ? "Counted toward your streak"
            : busy
              ? "Saving"
              : "Mark as read"}
        </button>
      )}
    </section>
  );
}
