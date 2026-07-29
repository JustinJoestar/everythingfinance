import { longDate } from "@/lib/dates";

import { LedgerRule } from "./ui/ledger-rule";

// The archive for signed-in users: one row per day, the day in the serif
// with the result in the mono data voice. Server-rendered; both the quiz
// and flashcard pages feed it their own rows.

export interface ArchiveRow {
  day: string; // YYYY-MM-DD
  value: string; // e.g. "5/6" or "8 of 8 cards"
}

export function ArchiveCard({
  title,
  emptyText,
  rows,
}: {
  title: string;
  emptyText: string;
  rows: ArchiveRow[];
}) {
  return (
    <section
      aria-label={title}
      className="rounded-xl border border-edge bg-surface p-6 shadow-sm"
    >
      <h2 className="font-serif text-lg font-semibold">{title}</h2>
      <LedgerRule className="mt-3 w-14" delay={0.1} />

      {rows.length === 0 ? (
        <p className="mt-4 text-sm text-muted">{emptyText}</p>
      ) : (
        <ul className="mt-4 divide-y divide-edge">
          {rows.map((r) => (
            <li
              key={r.day}
              className="flex items-baseline justify-between gap-3 py-2.5 first:pt-0 last:pb-0"
            >
              <span className="text-sm font-medium">{longDate(r.day)}</span>
              <span className="font-mono text-[13px] text-accent">
                {r.value}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
