import { ArrowRight, BookOpen, Brain, Flame, Newspaper } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  CategoryShowcase,
  type ShowcaseTile,
} from "@/components/ui/category-showcase";
import { Globe } from "@/components/ui/globe";
import { HeroSection } from "@/components/ui/hero-section";
import { LedgerRule } from "@/components/ui/ledger-rule";
import { Reveal } from "@/components/ui/reveal";
import { getShowcase } from "@/lib/data";
import { relativeTime } from "@/lib/dates";
import { CATEGORIES, CATEGORY_LABELS } from "@/lib/types";

// Refresh the prerendered landing page every 5 minutes so the showcase
// tracks each ingestion run without a database hit per visit.
export const revalidate = 300;

const SOURCES = [
  "Yahoo Finance",
  "CNBC",
  "MarketWatch",
  "CoinDesk",
  "Cointelegraph",
  "BBC News",
  "The Guardian",
  "Federal Reserve",
];

const FEATURES = [
  {
    icon: Newspaper,
    title: "One feed for everything",
    text: "Stocks, crypto, macro, and world events from major outlets in one stream. Each story gets a summary of two or three plain sentences.",
  },
  {
    icon: Brain,
    title: "Flashcards that stick",
    text: "Each week's news becomes a deck of spaced-repetition flashcards. A card comes back right before you'd forget it.",
  },
  {
    icon: BookOpen,
    title: "A glossary without jargon",
    text: "Every finance term defined in plain language. If one is missing, ask and it gets added for everyone.",
  },
  {
    icon: Flame,
    title: "A streak worth keeping",
    text: "Read the daily recap, review a card, or take the weekly quiz to keep your learning streak alive, one day at a time.",
  },
];

const STEPS = [
  {
    number: "01",
    title: "We read everything",
    text: "A pipeline pulls finance news from wire services, market desks, and central banks every 30 minutes.",
  },
  {
    number: "02",
    title: "AI translates it",
    text: "Each story gets one summary in plain English, without the jargon, and a category so you can filter to what you care about.",
  },
  {
    number: "03",
    title: "You make it stick",
    text: "A daily recap, weekly quiz, and spaced-repetition flashcards turn reading the news into actually understanding the markets.",
  },
];

export default async function LandingPage() {
  const showcase = await getShowcase();
  const tiles: ShowcaseTile[] = CATEGORIES.map((category) => ({
    category,
    label: CATEGORY_LABELS[category],
    stories: (showcase[category] ?? []).map((a) => ({
      url: a.url,
      title: a.title,
      summary: a.summary ?? "",
      source: a.source,
      time: relativeTime(a.published_at),
    })),
  }));

  return (
    <div className="space-y-20 pb-10 pt-6 sm:space-y-24 lg:pt-10">
      {/* ---- Hero: centered typewriter over the live category tiles ---- */}
      <section className="relative">
        <div
          className="pointer-events-none absolute -top-40 right-[-10%] -z-10 h-[480px] w-[480px] rounded-full bg-accent/[0.07] blur-3xl"
          aria-hidden
        />
        <div className="grid items-center gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:gap-10">
          {/* The globe fills the left space on wide screens; below lg there
              is no empty margin to fill, so it drops out and the hero
              centers on its own. */}
          <div className="hidden lg:block">
            <Globe className="mx-auto w-full max-w-[26rem]" />
          </div>
          <HeroSection
            title={
              <>
                Finance today,
                <br className="hidden sm:inline" /> in plain English.
              </>
            }
            animatedTexts={["Stocks", "Crypto", "Macro", "World news"]}
            subtitle="Every story lands in one feed, summarized in two or three plain sentences. Flashcards, quizzes, and a glossary help you remember what you read."
            primaryCta={{ label: "Read today’s feed", href: "/feed" }}
            secondaryCta={{ label: "How it works", href: "#how-it-works" }}
            finePrint="Free to read · No account required · Updated every 30 minutes"
          />
        </div>
        <div className="mt-14">
          <CategoryShowcase tiles={tiles} />
        </div>
      </section>

      {/* ---- Sources ---- */}
      <section aria-label="News sources">
        <Reveal>
          <p className="text-center font-mono text-xs font-medium uppercase tracking-[0.18em] text-faint">
            Compiling coverage from
          </p>
          <ul className="mx-auto mt-5 flex max-w-3xl flex-wrap items-center justify-center gap-x-4 gap-y-3">
            {SOURCES.map((name, i) => (
              <li
                key={name}
                className="flex items-center gap-4 whitespace-nowrap font-mono text-[13px] text-muted/90"
              >
                {i > 0 && (
                  <span className="text-accent/60" aria-hidden>
                    ·
                  </span>
                )}
                {name}
              </li>
            ))}
          </ul>
        </Reveal>
      </section>

      {/* ---- Features ---- */}
      <section aria-labelledby="features-heading">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <h2
              id="features-heading"
              className="font-serif text-3xl font-semibold tracking-tight sm:text-4xl"
            >
              Read it. Then actually remember it.
            </h2>
            <LedgerRule className="mx-auto mt-5 w-14" origin="center" delay={0.15} />
            <p className="mt-5 text-muted">
              Aggregators stop at the headline. Everything Finance is built for
              what happens after, when you try to remember what any of it
              meant.
            </p>
          </div>
        </Reveal>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map(({ icon: Icon, title, text }, i) => (
            <Reveal key={title} delay={i * 0.06} className="h-full">
              <div className="h-full rounded-xl border border-edge bg-surface p-6 transition-all duration-300 hover:-translate-y-1 hover:border-accent/40 hover:shadow-md">
                <span className="grid h-10 w-10 place-items-center rounded-lg bg-accent-soft text-accent">
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <h3 className="mt-4 text-base font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {text}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---- How it works ---- */}
      <section
        id="how-it-works"
        aria-labelledby="how-heading"
        className="scroll-mt-24"
      >
        <Reveal>
          <h2
            id="how-heading"
            className="text-center font-serif text-3xl font-semibold tracking-tight sm:text-4xl"
          >
            How it works
          </h2>
          <LedgerRule className="mx-auto mt-5 w-14" origin="center" delay={0.15} />
          <div className="mt-12 grid gap-10 lg:grid-cols-3 lg:gap-8">
            {STEPS.map(({ number, title, text }) => (
              <div key={number} className="border-t border-edge pt-6">
                <p className="font-mono text-sm font-medium text-accent">
                  {number}
                </p>
                <h3 className="mt-2 text-lg font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {text}
                </p>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* ---- Closing CTA ---- */}
      <Reveal>
        <section
          aria-label="Get started"
          className="rounded-2xl bg-panel px-8 py-14 text-center ring-1 ring-white/10"
        >
          <h2 className="mx-auto max-w-2xl text-balance font-serif text-3xl font-semibold tracking-tight text-panel-ink sm:text-4xl">
            Five minutes a day is enough to follow the markets.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-panel-muted">
            Start with today&rsquo;s recap. Come back tomorrow. The streak
            takes care of the rest.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button
              asChild
              size="lg"
              className="bg-[#d3ac47] text-[#10203a] shadow-sm hover:bg-[#e2be5e]"
            >
              <Link href="/feed" className="group">
                Read today&rsquo;s news
                <ArrowRight
                  className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5"
                  aria-hidden
                />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="ghost"
              className="text-panel-muted hover:bg-white/10 hover:text-panel-ink"
            >
              <Link href="/glossary">Browse the glossary</Link>
            </Button>
          </div>
        </section>
      </Reveal>
    </div>
  );
}
