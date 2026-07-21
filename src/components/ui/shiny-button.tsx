"use client";

import Link from "next/link";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

// Primary call-to-action with an animated gold shine. Styles live in
// globals.css (`.shiny-cta`, `.shiny-cta-gold`) alongside the site's other
// custom CSS. Renders a Next link when `href` is given, else a button.
// Children go inside a <span> because the shine's glow layer anchors to it.

interface ShinyButtonProps {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  className?: string;
  /** Gold pill instead of navy, for use on the dark CTA band. */
  gold?: boolean;
  "aria-label"?: string;
}

export function ShinyButton({
  children,
  href,
  onClick,
  className,
  gold,
  ...rest
}: ShinyButtonProps) {
  const classes = cn("shiny-cta", gold && "shiny-cta-gold", className);
  const inner = <span>{children}</span>;

  if (href) {
    return (
      <Link href={href} className={classes} {...rest}>
        {inner}
      </Link>
    );
  }
  return (
    <button type="button" className={classes} onClick={onClick} {...rest}>
      {inner}
    </button>
  );
}
