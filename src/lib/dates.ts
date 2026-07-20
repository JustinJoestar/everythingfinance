// All "day" boundaries in the app use US Eastern Time (America/New_York),
// so a "day" lines up with the US trading day for recaps and streaks.

const ET = "America/New_York";

/** Returns YYYY-MM-DD for the given instant, in Eastern Time. */
export function etDateString(d: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: ET,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

/** YYYY-MM-DD in ET for `days` days before today (ET). */
export function etDaysAgo(days: number): string {
  const today = etDateString();
  const [y, m, d] = today.split("-").map(Number);
  const utc = new Date(Date.UTC(y, m - 1, d));
  utc.setUTCDate(utc.getUTCDate() - days);
  return utc.toISOString().slice(0, 10);
}

/** YYYY-MM-DD of the Monday of the current week, in ET. */
export function etWeekStart(d: Date = new Date()): string {
  const today = etDateString(d);
  const [y, m, day] = today.split("-").map(Number);
  const utc = new Date(Date.UTC(y, m - 1, day));
  const dow = utc.getUTCDay(); // 0 = Sunday
  const diff = dow === 0 ? 6 : dow - 1;
  utc.setUTCDate(utc.getUTCDate() - diff);
  return utc.toISOString().slice(0, 10);
}

/** Difference in whole days between two YYYY-MM-DD strings (a - b). */
export function dayDiff(a: string, b: string): number {
  const toUTC = (s: string) => {
    const [y, m, d] = s.split("-").map(Number);
    return Date.UTC(y, m - 1, d);
  };
  return Math.round((toUTC(a) - toUTC(b)) / 86_400_000);
}

/** Human-friendly relative time, e.g. "3h ago". */
export function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  const mins = Math.max(0, Math.round((Date.now() - then) / 60_000));
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: ET,
  });
}

/** Long-form ET date for headings, e.g. "Friday, July 10". */
export function etLongDate(d: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: ET,
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(d);
}
