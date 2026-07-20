"use client";

import { motion, useReducedMotion } from "framer-motion";

import { cn } from "@/lib/utils";

// The gold ledger rule, drawn left to right when it scrolls into view.
// Use origin="center" for rules under centered headings.

export function LedgerRule({
  className,
  origin = "left",
  delay = 0,
}: {
  className?: string;
  origin?: "left" | "center";
  delay?: number;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      aria-hidden
      className={cn("ledger-rule", className)}
      style={{ transformOrigin: origin }}
      initial={reduceMotion ? false : { scaleX: 0 }}
      whileInView={reduceMotion ? undefined : { scaleX: 1 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.7, delay, ease: [0.3, 0.6, 0.2, 1] }}
    />
  );
}
