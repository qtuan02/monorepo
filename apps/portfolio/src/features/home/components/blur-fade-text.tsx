"use client";

import type { Variants } from "motion/react";
import type { ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";

import { cn } from "@monorepo/ui/utils/cn";

/**
 * Which element the animated line renders as.
 *
 * A visual heading is not a heading. The greeting is the largest text on the
 * page and names the site's subject, so it has to be the document's one `<h1>`
 * — otherwise the outline starts at `<h2>`, a screen-reader user cycling
 * headings never lands on the name, and an indexer reads a page whose top-level
 * heading is missing. `<title>` does not substitute for it.
 */
type BlurFadeTextElement = "span" | "h1";

const ELEMENTS = {
  span: motion.span,
  h1: motion.h1,
} as const satisfies Record<BlurFadeTextElement, unknown>;

/** The same two tags without motion, for a reader who asked for none. */
const STATIC_ELEMENTS = {
  span: "span",
  h1: "h1",
} as const satisfies Record<BlurFadeTextElement, string>;

interface BlurFadeTextProps {
  text: string;
  /** Rendered right after the text, inside the same animated element. */
  postFix?: ReactNode;
  /** Defaults to `span` — pass `h1` for the one line that names the page. */
  as?: BlurFadeTextElement;
  className?: string;
  delay?: number;
  yOffset?: number;
}

/**
 * The heading twin of `BlurFade`: one line of text that fades and unblurs in.
 *
 * The legacy component also had an `animateByCharacter` branch that split the
 * string and animated each letter. No call site set it, and a per-character
 * split would have put one `<span>` per letter into the HTML a crawler reads —
 * so the branch is gone rather than carried.
 */
export default function BlurFadeText({
  text,
  postFix,
  as = "span",
  className,
  delay = 0,
  yOffset = 12,
}: BlurFadeTextProps) {
  const prefersReducedMotion = useReducedMotion();

  const variants: Variants = {
    hidden: { y: yOffset, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  if (prefersReducedMotion) {
    const StaticElement = STATIC_ELEMENTS[as];

    return (
      <div className="flex">
        <StaticElement
          data-slot="blur-fade-text"
          className={cn("inline-flex", className)}
        >
          {text}
          {postFix}
        </StaticElement>
      </div>
    );
  }

  const Element = ELEMENTS[as];

  return (
    <div className="flex">
      <Element
        data-slot="blur-fade-text"
        initial="hidden"
        animate="visible"
        variants={variants}
        transition={{ repeat: 0, delay, duration: 0.35, ease: "easeOut" }}
        className={cn("inline-flex", className)}
      >
        {text}
        {postFix}
      </Element>
    </div>
  );
}
