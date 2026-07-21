"use client";

import { useSyncExternalStore } from "react";

// Shared "next pipeline update" clock. Ingestion (and, when it brings in
// new articles, the recap) refreshes at these minutes past each hour, in
// UTC. Keep in sync with the ingest cron in .github/workflows/cron.yml.
export const UPDATE_MINUTES = [0, 30];

// Seconds until the next scheduled update, computed in UTC so the count is
// right in any viewer timezone.
export function secsToNextUpdate(now: Date): number {
  const secOfHour = now.getUTCMinutes() * 60 + now.getUTCSeconds();
  for (const min of UPDATE_MINUTES) {
    const target = min * 60;
    if (secOfHour < target) return target - secOfHour;
  }
  return 3600 - secOfHour + UPDATE_MINUTES[0] * 60;
}

export function formatCountdown(totalSecs: number): string {
  const m = Math.floor(totalSecs / 60);
  const s = totalSecs % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

let lastTick = Math.floor(Date.now() / 1000);
function subscribe(onChange: () => void) {
  const id = setInterval(() => {
    lastTick = Math.floor(Date.now() / 1000);
    onChange();
  }, 1000);
  return () => clearInterval(id);
}
const getTick = () => lastTick;

// A live epoch-second tick, or null before hydration (so the server and
// first client render match).
export function useSecondTick(): number | null {
  return useSyncExternalStore<number | null>(subscribe, getTick, () => null);
}

// A live "M:SS" until the next update, or null before hydration.
export function useNextUpdate(): string | null {
  const tick = useSecondTick();
  return tick === null
    ? null
    : formatCountdown(secsToNextUpdate(new Date(tick * 1000)));
}
