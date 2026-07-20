"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import type { CSSProperties } from "react";
import { useEffect, useRef, useState } from "react";

import type { Category } from "@/lib/types";

import { CategoryTag } from "../CategoryTag";

// The landing hero's live panel: one tile per category, each rotating
// through that category's latest stories. Headlines link to the original
// article; each tile links to its filtered feed. Rotation pauses while
// the cursor is over a tile and stays put for reduced-motion users.

export interface ShowcaseStory {
  url: string;
  title: string;
  summary: string;
  source: string;
  time: string;
}

export interface ShowcaseTile {
  category: Category;
  label: string;
  stories: ShowcaseStory[];
}

const ROTATE_MS = 6000;

function Tile({ tile, index }: { tile: ShowcaseTile; index: number }) {
  const reduceMotion = useReducedMotion();
  const [current, setCurrent] = useState(0);
  const paused = useRef(false);
  const count = tile.stories.length;

  useEffect(() => {
    if (reduceMotion || count < 2) return;
    // Phase-offset each tile so the four don't all flip at once.
    let interval: ReturnType<typeof setInterval>;
    const phase = setTimeout(() => {
      interval = setInterval(() => {
        if (!paused.current) setCurrent((i) => (i + 1) % count);
      }, ROTATE_MS);
    }, index * 1500);
    return () => {
      clearTimeout(phase);
      clearInterval(interval);
    };
  }, [reduceMotion, count, index]);

  const story = tile.stories[current];

  return (
    <div
      className="anim-rise flex flex-col rounded-xl border border-edge bg-surface p-5 transition-shadow duration-300 hover:shadow-md"
      style={{ "--d": `${0.35 + index * 0.12}s` } as CSSProperties}
      onMouseEnter={() => (paused.current = true)}
      onMouseLeave={() => (paused.current = false)}
    >
      <div className="flex items-center justify-between gap-2">
        <CategoryTag category={tile.category} />
        {count > 1 && (
          <span className="flex gap-1" aria-hidden>
            {tile.stories.map((_, i) => (
              <span
                key={i}
                className={`h-1 w-1 rounded-full transition-colors duration-300 ${
                  i === current ? "bg-accent" : "bg-edge"
                }`}
              />
            ))}
          </span>
        )}
      </div>

      <div className="relative mt-3 min-h-[7rem] flex-1">
        {story ? (
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={story.url}
              initial={reduceMotion ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
              transition={{ duration: 0.4, ease: [0.25, 0.5, 0.3, 1] }}
            >
              <a
                href={story.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-serif text-base font-semibold leading-snug transition-colors hover:text-accent"
              >
                <span className="line-clamp-2">{story.title}</span>
              </a>
              <p className="mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-muted">
                {story.summary}
              </p>
              <p className="mt-1.5 font-mono text-[11px] text-faint">
                {story.source} · {story.time}
              </p>
            </motion.div>
          </AnimatePresence>
        ) : (
          <p className="text-[13px] text-muted">
            No {tile.label.toLowerCase()} stories yet. The next ingestion run
            fills this in.
          </p>
        )}
      </div>

      <Link
        href={`/feed?category=${tile.category}`}
        className="mt-3 font-mono text-[11px] font-medium text-accent hover:underline"
      >
        More {tile.label.toLowerCase()} →
      </Link>
    </div>
  );
}

export function CategoryShowcase({ tiles }: { tiles: ShowcaseTile[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {tiles.map((tile, i) => (
        <Tile key={tile.category} tile={tile} index={i} />
      ))}
    </div>
  );
}
