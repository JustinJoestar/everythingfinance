"use client";

import { track } from "@vercel/analytics";
import { useMemo, useState } from "react";

import type { GlossaryEntry } from "@/lib/types";

export function GlossaryExplorer({
  initialEntries,
}: {
  initialEntries: GlossaryEntry[];
}) {
  const [entries, setEntries] = useState(initialEntries);
  const [query, setQuery] = useState("");
  const [asking, setAsking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return entries;
    return entries.filter(
      (e) =>
        e.term.toLowerCase().includes(q) ||
        e.definition.toLowerCase().includes(q)
    );
  }, [entries, query]);

  const exactMatch = entries.some(
    (e) => e.term.toLowerCase() === query.trim().toLowerCase()
  );

  async function askAI() {
    const term = query.trim();
    if (!term || asking) return;
    setAsking(true);
    setError(null);
    try {
      const res = await fetch("/api/glossary/define", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ term }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Try again.");
        return;
      }
      const entry: GlossaryEntry = data.entry;
      setEntries((prev) =>
        [entry, ...prev.filter((e) => e.slug !== entry.slug)].sort((a, b) =>
          a.term.localeCompare(b.term)
        )
      );
      setQuery(entry.term);
      track("activity_completed", { type: "glossary_define" });
    } catch {
      setError("Network error. Try again.");
    } finally {
      setAsking(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <svg
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-faint"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          aria-hidden
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search a term, like yield curve or stablecoin"
          aria-label="Search glossary"
          className="w-full rounded-lg border border-edge bg-surface py-3 pl-10 pr-4 text-sm shadow-sm outline-none transition-colors placeholder:text-faint focus:border-accent focus:ring-2 focus:ring-accent/20"
        />
      </div>

      {error && (
        <p className="rounded-lg border border-danger/30 bg-danger/10 px-4 py-2.5 text-sm text-danger">
          {error}
        </p>
      )}

      {query.trim().length > 1 && !exactMatch && (
        <button
          onClick={askAI}
          disabled={asking}
          className="w-full rounded-lg border border-dashed border-accent/40 bg-accent-soft px-4 py-3 text-sm font-medium text-accent transition-colors hover:border-accent disabled:opacity-60"
        >
          {asking
            ? "Asking the AI…"
            : `Can’t find it? Ask the AI to define “${query.trim()}”`}
        </button>
      )}

      <p className="font-mono text-xs font-medium uppercase tracking-[0.14em] text-faint">
        {filtered.length} term{filtered.length === 1 ? "" : "s"}
      </p>

      <div className="space-y-3">
        {filtered.map((e) => (
          <div
            key={e.slug}
            className="rounded-xl border border-edge bg-surface p-5"
          >
            <div className="flex items-center gap-2">
              <h3 className="font-serif text-base font-semibold">{e.term}</h3>
              {e.source === "ai" && (
                <span className="rounded-full bg-accent-soft px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-wide text-accent">
                  AI-defined
                </span>
              )}
            </div>
            <p className="mt-1.5 text-sm leading-relaxed text-muted">
              {e.definition}
            </p>
          </div>
        ))}
        {filtered.length === 0 && query.trim().length <= 1 && (
          <p className="py-8 text-center text-sm text-muted">
            No terms yet. The glossary gets seeded during setup.
          </p>
        )}
      </div>
    </div>
  );
}
