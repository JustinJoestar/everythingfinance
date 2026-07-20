"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { AuthButton } from "./AuthButton";
import { ThemeToggle } from "./ThemeToggle";
import { Logo } from "./ui/logo";

const NAV = [
  { href: "/feed", label: "Feed" },
  { href: "/flashcards", label: "Flashcards" },
  { href: "/quiz", label: "Quiz" },
  { href: "/glossary", label: "Glossary" },
];

export function Header({
  userEmail,
  streakDays,
}: {
  userEmail: string | null;
  streakDays: number;
}) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-edge bg-surface/90 backdrop-blur-md">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between gap-3">
          <Link href="/" className="flex shrink-0 items-center gap-2.5">
            <Logo className="h-8 w-8" />
            <span className="font-serif text-lg font-semibold tracking-tight">
              Everything Finance
            </span>
          </Link>

          <div className="flex items-center gap-1.5">
            {streakDays > 0 && (
              <span
                title={`${streakDays}-day learning streak`}
                className="mr-1 hidden items-center gap-1.5 rounded-full bg-accent-soft px-2.5 py-1 font-mono text-xs font-medium text-accent sm:flex"
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
                </svg>
                {streakDays}-day streak
              </span>
            )}
            <ThemeToggle />
            <AuthButton userEmail={userEmail} />
          </div>
        </div>

        <nav className="-mb-px flex gap-1 overflow-x-auto" aria-label="Main">
          {NAV.map(({ href, label }) => {
            const active = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`whitespace-nowrap border-b-2 px-3 pb-2.5 pt-1 text-sm font-medium transition-colors ${
                  active
                    ? "border-accent text-ink"
                    : "border-transparent text-muted hover:text-ink"
                }`}
              >
                {label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
