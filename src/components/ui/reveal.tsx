"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

// A quiet fade-and-rise entrance, triggered once on scroll into view.
// Deliberately subtle; renders static for users who prefer reduced motion.

export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={reduceMotion ? false : { opacity: 0, y: 14 }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay, ease: [0.25, 0.5, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
