"use client";

import type { MouseEvent, ReactNode } from "react";
import { useState } from "react";
import { AnimatePresence, motion, useMotionTemplate } from "motion/react";

interface LensProps {
  children: ReactNode;
  /** How much the area under the lens is magnified. */
  zoomFactor?: number;
  /** Diameter of the circular lens, in pixels. */
  lensSize?: number;
  /** Seconds the lens takes to appear and disappear. */
  duration?: number;
  /** Accessible name for the zoom region. */
  ariaLabel: string;
}

/**
 * A magnifying circle that follows the pointer over whatever it wraps.
 *
 * `children` is rendered twice — once as the flat image, once inside the
 * masked, scaled overlay — which is why it takes a node rather than a render
 * callback: both copies come from the server, so the underlying image is in the
 * first HTML whether or not the pointer ever arrives.
 *
 * The legacy version validated `zoomFactor` and `lensSize` by throwing during
 * render. The prop types already say what those values are, and a throw in
 * render takes the whole page down rather than the lens, so both are gone.
 */
export function Lens({
  children,
  zoomFactor = 1.3,
  lensSize = 170,
  duration = 0.1,
  ariaLabel,
}: LensProps) {
  const [isHovering, setIsHovering] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  function handleMouseMove(event: MouseEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    setPosition({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    });
  }

  // A motion template rather than a plain string: it re-evaluates on the
  // motion clock instead of forcing a React render per pointer move.
  const maskImage = useMotionTemplate`radial-gradient(circle ${lensSize / 2}px at ${position.x}px ${position.y}px, black 100%, transparent 100%)`;

  return (
    <section
      className="relative z-20 overflow-hidden rounded-xl"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onMouseMove={handleMouseMove}
      aria-label={ariaLabel}
    >
      {children}
      <AnimatePresence mode="popLayout">
        {isHovering && (
          <motion.div
            initial={{ opacity: 0, scale: 0.58 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration }}
            className="absolute inset-0 z-50 overflow-hidden"
            // Every value here is a live pointer measurement, so there is no
            // utility to reach for — this is the exception the styling rule
            // reserves for runtime-dynamic values.
            style={{
              maskImage,
              WebkitMaskImage: maskImage,
              transformOrigin: `${position.x}px ${position.y}px`,
            }}
          >
            <div
              className="absolute inset-0"
              style={{
                transform: `scale(${zoomFactor})`,
                transformOrigin: `${position.x}px ${position.y}px`,
              }}
            >
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
