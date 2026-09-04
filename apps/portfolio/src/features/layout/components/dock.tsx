"use client";

import type { MotionValue } from "motion/react";
import type { ReactNode } from "react";
import { createContext, useContext, useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";

import { cn } from "@monorepo/ui/utils/cn";

const DEFAULT_MAGNIFICATION = 60;
const DEFAULT_DISTANCE = 140;

interface DockContextValue {
  /** The pointer's page-x, or Infinity while the pointer is away. */
  mouseX: MotionValue<number>;
  /** Width, in pixels, an icon reaches directly under the pointer. */
  magnification: number;
  /** How far, in pixels, the magnification reaches either side. */
  distance: number;
}

/**
 * The pointer position, passed by context rather than by cloning each child.
 *
 * The upstream component injected these three values with
 * `React.Children.map` + `cloneElement`, which typed every child as `any` and
 * only worked for a direct child. A context reads the same in a `.map`, in a
 * wrapper, and at any depth — and it is what lets `navbar.template.tsx` render
 * its icons through an array without the dock knowing anything about them.
 */
const DockContext = createContext<DockContextValue | null>(null);

interface DockProps {
  children: ReactNode;
  className?: string;
  magnification?: number;
  distance?: number;
}

/** The macOS-style bar: icons swell as the pointer travels along it. */
export function Dock({
  children,
  className,
  magnification = DEFAULT_MAGNIFICATION,
  distance = DEFAULT_DISTANCE,
}: DockProps) {
  const mouseX = useMotionValue(Number.POSITIVE_INFINITY);

  return (
    <DockContext value={{ mouseX, magnification, distance }}>
      <motion.div
        onMouseMove={(event) => mouseX.set(event.pageX)}
        onMouseLeave={() => mouseX.set(Number.POSITIVE_INFINITY)}
        className={cn(
          "mx-auto flex h-full w-max items-end rounded-full border p-2",
          className,
        )}
      >
        {children}
      </motion.div>
    </DockContext>
  );
}

interface DockIconProps {
  children?: ReactNode;
  className?: string;
}

/** One slot in the dock. Its width tracks the pointer's distance from it. */
export function DockIcon({ children, className }: DockIconProps) {
  const context = useContext(DockContext);

  if (!context) {
    throw new Error("DockIcon must be rendered inside a Dock.");
  }

  const { mouseX, magnification, distance } = context;
  const ref = useRef<HTMLDivElement>(null);

  const distanceFromPointer = useTransform(mouseX, (value: number) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return value - bounds.x - bounds.width / 2;
  });

  const targetWidth = useTransform(
    distanceFromPointer,
    [-distance, 0, distance],
    [40, magnification, 40],
  );

  const width = useSpring(targetWidth, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });

  return (
    <motion.div
      ref={ref}
      // A live motion value, so there is no utility to reach for — this is the
      // runtime-dynamic exception the styling rule reserves.
      style={{ width }}
      className={cn(
        "flex aspect-square items-center justify-center rounded-full",
        className,
      )}
    >
      {children}
    </motion.div>
  );
}
