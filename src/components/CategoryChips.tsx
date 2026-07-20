"use client";

import Link from "next/link";

import { CATEGORIES, CATEGORY_LABELS, type Category } from "@/lib/types";

export function CategoryChips({ active }: { active?: Category }) {
  const chip = (label: string, href: string, isActive: boolean) => (
    <Link
      key={href}
      href={href}
      scroll={false}
      className={`rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition-all duration-300 ${
        isActive
          ? "border-accent bg-accent text-accent-ink"
          : "border-edge bg-surface text-muted hover:-translate-y-px hover:border-faint hover:text-ink"
      }`}
    >
      {label}
    </Link>
  );

  return (
    <div
      className="flex flex-wrap gap-2"
      role="navigation"
      aria-label="Filter by category"
    >
      {chip("All", "/feed", !active)}
      {CATEGORIES.map((c) =>
        chip(CATEGORY_LABELS[c], `/feed?category=${c}`, active === c)
      )}
    </div>
  );
}
