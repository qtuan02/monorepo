"use client";

import type { Variants } from "motion/react";
import type { ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";

interface BlurFadeProps {
  children: ReactNode;
  className?: string;
  /** Seconds the fade itself takes. */
  duration?: number;
  /** Seconds to wait before starting — how the page staggers its sections. */
  delay?: number;
  /** Vertical travel, in pixels, the block rises through. */
  yOffset?: number;
}

/**
 * Fades a block in on mount, slightly displaced, after `delay`.
 *
 * It animates on **mount**, not on scroll: the legacy component carried an
 * `inView` prop and a `useInView` observer, but no call site ever passed the
 * prop, so the observer's result was discarded on every render. Dropping it
 * leaves the behaviour the site actually has and removes a ref and a listener
 * per section.
 *
 * Nothing here is conditional on the browser, so the server still renders the
 * children into the first HTML — the animation only decides how they arrive.
 *
 * There is no blur any more. It cost a filter repaint on every frame of every
 * section's entrance to make text briefly unreadable, which is the opposite of
 * what an entrance is for.
 */
export default function BlurFade({
  children,
  className,
  duration = 0.35,
  delay = 0,
  yOffset = 12,
}: BlurFadeProps) {
  // `null` on the server and on the first client render, so the markup the
  // server sends and the markup React hydrates into agree; the preference is
  // known from the first effect onward, before any entrance could matter.
  const prefersReducedMotion = useReducedMotion();

  const variants: Variants = {
    hidden: { y: yOffset, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  if (prefersReducedMotion) {
    // Not `duration: 0` on the same animation: a reader who asked for no
    // motion should never be handed a tree that starts at `opacity: 0`, in
    // case the animation is the thing that fails to run.
    return (
      <div data-slot="blur-fade" className={className}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      data-slot="blur-fade"
      initial="hidden"
      animate="visible"
      variants={variants}
      transition={{ delay: 0.04 + delay, duration, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
