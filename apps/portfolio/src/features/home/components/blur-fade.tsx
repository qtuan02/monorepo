"use client";

import type { Variants } from "motion/react";
import type { ReactNode } from "react";
import { motion } from "motion/react";

interface BlurFadeProps {
  children: ReactNode;
  className?: string;
  /** Seconds the fade itself takes. */
  duration?: number;
  /** Seconds to wait before starting — how the page staggers its sections. */
  delay?: number;
  /** Vertical travel, in pixels, either side of the resting position. */
  yOffset?: number;
  /** Blur radius the element starts from, as a CSS length. */
  blur?: string;
}

/**
 * Fades a block in on mount, blurred and slightly displaced, after `delay`.
 *
 * It animates on **mount**, not on scroll: the legacy component carried an
 * `inView` prop and a `useInView` observer, but no call site ever passed the
 * prop, so the observer's result was discarded on every render. Dropping it
 * leaves the behaviour the site actually has and removes a ref and a listener
 * per section.
 *
 * Nothing here is conditional on the browser, so the server still renders the
 * children into the first HTML — the animation only decides how they arrive.
 */
export default function BlurFade({
  children,
  className,
  duration = 0.4,
  delay = 0,
  yOffset = 6,
  blur = "6px",
}: BlurFadeProps) {
  const variants: Variants = {
    hidden: { y: yOffset, opacity: 0, filter: `blur(${blur})` },
    visible: { y: -yOffset, opacity: 1, filter: "blur(0px)" },
  };

  return (
    <motion.div
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
