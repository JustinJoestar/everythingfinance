import Link from "next/link";

import { Logo } from "./ui/logo";

const FOOTER_NAV = [
  { href: "/feed", label: "Feed" },
  { href: "/flashcards", label: "Flashcards" },
  { href: "/quiz", label: "Weekly quiz" },
  { href: "/glossary", label: "Glossary" },
];

export function Footer() {
  return (
    <footer className="border-t border-edge bg-surface">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm">
            <div className="flex items-center gap-2.5">
              <Logo className="h-8 w-8" />
              <p className="font-serif text-base font-semibold">
                Everything Finance
              </p>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-muted">
              Finance news in plain English, with flashcards, quizzes, and a
              glossary that help it stick.
            </p>
          </div>

          <nav aria-label="Footer" className="shrink-0">
            <p className="font-mono text-xs font-medium uppercase tracking-[0.18em] text-accent">
              Explore
            </p>
            <ul className="mt-3 space-y-2 text-sm text-muted">
              {FOOTER_NAV.map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="transition-colors hover:text-ink">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-10 space-y-3 border-t border-edge pt-6 text-xs leading-relaxed text-faint">
          <p>
            Summaries are AI-generated from public headlines and may contain
            errors; always check the original source. Nothing here is
            investment advice. Headlines belong to their publishers, and we
            link to every original article.
          </p>
          <p>© 2026 Everything Finance</p>
        </div>
      </div>
    </footer>
  );
}
