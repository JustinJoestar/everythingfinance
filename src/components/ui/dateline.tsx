"use client";

import { RefreshCw } from "lucide-react";

import {
  formatCountdown,
  secsToNextUpdate,
  useSecondTick,
} from "./use-next-update";

// The hero kicker: today's date in the serif with a live Eastern Time
// clock on the same baseline, like a newspaper's edition line. The app
// thinks in ET days (recaps, streaks), so the clock is ET, labeled.
// Alongside it, a live countdown to the next pipeline update (shared with
// the recap card). useSecondTick keeps hydration clean: the server renders
// the placeholder, and the client swaps in the real time after mount.

const ET = "America/New_York";

export function Dateline() {
  const tick = useSecondTick();
  const now = tick === null ? null : new Date(tick * 1000);

  const date = now
    ? now.toLocaleDateString("en-US", {
        timeZone: ET,
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : " ";

  const time = now
    ? now.toLocaleTimeString("en-US", {
        timeZone: ET,
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
    : "--:--:--";

  const secsLeft = now ? secsToNextUpdate(now) : null;
  const countdown = secsLeft === null ? "--:--" : formatCountdown(secsLeft);

  return (
    <div className="flex flex-wrap items-baseline justify-center gap-x-4 gap-y-1">
      <p className="font-serif text-xl font-semibold tracking-tight text-ink sm:text-2xl">
        {date}
      </p>
      <p className="flex items-center gap-2 font-mono text-[13px] text-muted">
        <span
          className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent motion-reduce:animate-none"
          aria-hidden
        />
        <span className="tabular-nums">{time}</span>
        <span className="text-faint">ET</span>
      </p>
      <p className="flex items-center gap-1.5 font-mono text-[13px] text-faint">
        <RefreshCw className="h-3 w-3" aria-hidden />
        <span>next update in</span>
        <span className="tabular-nums text-muted">{countdown}</span>
      </p>
    </div>
  );
}
