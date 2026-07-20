"use client";

import { useSyncExternalStore } from "react";

// The hero kicker: today's date in the serif with a live Eastern Time
// clock on the same baseline, like a newspaper's edition line. The app
// thinks in ET days (recaps, streaks), so the clock is ET, labeled.
// useSyncExternalStore keeps hydration clean: the server renders the
// placeholder, and the client swaps in the real time right after mount.

const ET = "America/New_York";

let lastTick = Math.floor(Date.now() / 1000);

function subscribe(onChange: () => void) {
  const id = setInterval(() => {
    lastTick = Math.floor(Date.now() / 1000);
    onChange();
  }, 1000);
  return () => clearInterval(id);
}

const getTick = () => lastTick;
const getServerTick = () => null;

export function Dateline() {
  const tick = useSyncExternalStore<number | null>(
    subscribe,
    getTick,
    getServerTick
  );
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

  return (
    <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
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
    </div>
  );
}
