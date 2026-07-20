import type { Metadata } from "next";
import Link from "next/link";

import { ArticleCard } from "@/components/ArticleCard";
import { CategoryChips } from "@/components/CategoryChips";
import { RecapCard } from "@/components/RecapCard";
import { PageHero } from "@/components/ui/page-hero";
import { supabaseConfigured } from "@/lib/config";
import {
  getArticles,
  getLatestRecap,
  getSessionUser,
  getStreak,
} from "@/lib/data";
import { etDateString, etLongDate } from "@/lib/dates";
import { CATEGORIES, type Category } from "@/lib/types";

export const metadata: Metadata = {
  title: "Feed",
  description:
    "The latest finance news, summarized in plain English: stocks, crypto, macro, and world events.",
};

export default async function FeedPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; page?: string }>;
}) {
  const params = await searchParams;
  const category = CATEGORIES.includes(params.category as Category)
    ? (params.category as Category)
    : undefined;
  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);

  const [{ articles, hasMore }, recap, user, streak] = await Promise.all([
    getArticles({ category, page }),
    getLatestRecap(),
    getSessionUser(),
    getStreak(),
  ]);

  const recapIsToday = recap?.recap_date === etDateString();

  return (
    <div className="space-y-8">
      <PageHero
        eyebrow="Feed"
        title="Today in the markets"
        description="The day's stories, summarized in plain English as they land. Filter by what you care about."
      />

      {!supabaseConfigured && (
        <p className="rounded-lg border border-edge bg-raised px-4 py-3 text-sm text-muted">
          <strong className="font-semibold text-ink">Preview build:</strong>{" "}
          you&rsquo;re seeing sample content until the ingestion pipeline is
          connected. Setup steps are in the README.
        </p>
      )}

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-8">
        {/* Recap first in the DOM so it leads on mobile; sidebar on desktop */}
        <aside className="lg:order-2">
          <div className="lg:sticky lg:top-28">
            {recap && (
              <RecapCard
                recap={recap}
                heading={recapIsToday ? etLongDate() : recap.recap_date}
                signedIn={Boolean(user)}
                alreadyDoneToday={streak?.last_activity_date === etDateString()}
              />
            )}
          </div>
        </aside>

        <div className="space-y-4 lg:order-1">
          <CategoryChips active={category} />

          {articles.length === 0 ? (
            <div className="rounded-xl border border-edge bg-surface p-10 text-center text-muted">
              <p className="font-serif text-lg font-semibold text-ink">
                No stories yet
              </p>
              <p className="mt-2 text-sm">
                The ingestion job hasn’t pulled any {category ?? ""} news yet.
                Check back soon.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {articles.map((a) => (
                <ArticleCard key={a.id} article={a} />
              ))}
            </div>
          )}

          {hasMore && (
            <div className="flex justify-center pt-2">
              <Link
                href={`/feed?${new URLSearchParams({
                  ...(category ? { category } : {}),
                  page: String(page + 1),
                })}`}
                scroll={false}
                className="rounded-lg border border-edge bg-surface px-5 py-2.5 text-sm font-medium text-accent shadow-sm transition-all duration-300 hover:-translate-y-px hover:bg-raised"
              >
                Load older stories
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
