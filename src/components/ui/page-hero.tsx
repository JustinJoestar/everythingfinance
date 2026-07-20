import type { CSSProperties } from "react";

// Inner-page header: mono eyebrow, Besley title, and the gold ledger
// rule, the accounting "total" mark that closes every heading. The block
// rises on load and the rule draws itself.

export function PageHero({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <header className="pb-8 pt-10">
      <div className="anim-rise">
        <p className="font-mono text-xs font-medium uppercase tracking-[0.18em] text-accent">
          {eyebrow}
        </p>
        <h1 className="mt-2 font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
          {title}
        </h1>
      </div>
      <div
        className="ledger-rule anim-rule mt-4 w-14"
        style={{ "--d": "0.35s" } as CSSProperties}
        aria-hidden
      />
      {description && (
        <p
          className="anim-rise mt-4 max-w-2xl text-pretty leading-relaxed text-muted"
          style={{ "--d": "0.12s" } as CSSProperties}
        >
          {description}
        </p>
      )}
    </header>
  );
}
