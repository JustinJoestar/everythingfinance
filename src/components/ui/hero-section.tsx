"use client";

import { useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Dateline } from "@/components/ui/dateline";
import { ShinyButton } from "@/components/ui/shiny-button";
import { LedgerRule } from "@/components/ui/ledger-rule";
import { cn } from "@/lib/utils";

// Centered hero. The headline is static; under it, a gold mono ticker
// line types the feed's categories one at a time, like a terminal tag.
// Under reduced motion the word swaps whole on a timer, with no typing
// and no cursor. The moving line is aria-hidden; screen readers get the
// category list once as plain text.

const d = (s: number) => ({ "--d": `${s}s` }) as CSSProperties;

const TYPE_MS = 110;
const DELETE_MS = 55;
const HOLD_MS = 2200;
const SWAP_MS = 4000;

export interface HeroSectionProps {
  className?: string;
  title: ReactNode;
  animatedTexts: string[];
  subtitle: string;
  primaryCta: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
  finePrint?: string;
}

export function HeroSection({
  className,
  title,
  animatedTexts,
  subtitle,
  primaryCta,
  secondaryCta,
  finePrint,
}: HeroSectionProps) {
  const reduceMotion = useReducedMotion() ?? false;
  const [wordIndex, setWordIndex] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const word = animatedTexts[wordIndex % animatedTexts.length];

  useEffect(() => {
    if (!reduceMotion) return;
    const id = setInterval(
      () => setWordIndex((i) => (i + 1) % animatedTexts.length),
      SWAP_MS
    );
    return () => clearInterval(id);
  }, [reduceMotion, animatedTexts.length]);

  useEffect(() => {
    if (reduceMotion) return;
    const delay = deleting
      ? DELETE_MS
      : charCount === word.length
        ? HOLD_MS
        : TYPE_MS;
    const id = setTimeout(() => {
      if (!deleting) {
        if (charCount < word.length) setCharCount((c) => c + 1);
        else setDeleting(true);
      } else if (charCount > 0) {
        setCharCount((c) => c - 1);
      } else {
        setDeleting(false);
        setWordIndex((i) => (i + 1) % animatedTexts.length);
      }
    }, delay);
    return () => clearTimeout(id);
  }, [reduceMotion, deleting, charCount, word, animatedTexts.length]);

  const shown = reduceMotion ? word : word.slice(0, charCount);

  return (
    <div className={cn("flex flex-col items-center text-center", className)}>
      <div className="anim-rise flex justify-center" style={d(0)}>
        <Dateline />
      </div>

      <h1
        className="anim-rise mt-5 font-serif text-4xl font-semibold leading-[1.12] tracking-tight sm:text-5xl 2xl:text-6xl"
        style={d(0.08)}
      >
        {title}
      </h1>

      {/* The ticker line: categories type in one at a time. */}
      <p
        className="anim-rise mt-5 min-h-[1.5em] font-mono text-sm font-medium uppercase tracking-[0.22em] text-accent sm:text-base"
        style={d(0.2)}
      >
        <span aria-hidden>
          {shown}
          {!reduceMotion && (
            <span className="animate-pulse text-accent/70">|</span>
          )}
        </span>
        <span className="sr-only">
          {animatedTexts.join(", ").replace(/, ([^,]*)$/, ", and $1")}
        </span>
      </p>

      <LedgerRule className="mt-7 w-14" origin="center" delay={0.45} />

      <p
        className="anim-rise mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-muted"
        style={d(0.16)}
      >
        {subtitle}
      </p>

      <div
        className="anim-rise mt-8 flex flex-wrap items-center justify-center gap-3"
        style={d(0.26)}
      >
        <ShinyButton href={primaryCta.href}>
          {primaryCta.label}
          <ArrowRight className="h-4 w-4" aria-hidden />
        </ShinyButton>
        {secondaryCta && (
          <Button asChild size="lg" variant="outline" className="rounded-full">
            <Link href={secondaryCta.href}>{secondaryCta.label}</Link>
          </Button>
        )}
      </div>

      {finePrint && (
        <p
          className="anim-rise mt-6 font-mono text-[13px] text-faint"
          style={d(0.34)}
        >
          {finePrint}
        </p>
      )}
    </div>
  );
}
