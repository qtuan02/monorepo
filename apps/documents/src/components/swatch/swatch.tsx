import type { CSSProperties } from "react";

import { cn } from "@monorepo/ui/utils/cn";

import { slugToHue } from "~/utils/slug-to-hue";

const swatchSizes = {
  /** A palette row. */
  sm: "size-5.5 rounded-[7px]",
  /** A tile in the list grids. */
  md: "size-9.5 rounded-xl",
  /** The hero of a detail page. */
  lg: "size-30 rounded-[32px]",
} as const;

interface SwatchProps {
  slug: string;
  size?: keyof typeof swatchSizes;
  className?: string;
}

/**
 * An entry's visual signature: a two-stop gradient whose hue is hashed from
 * the slug, so `dialog` is the same colour on its tile, in the search palette
 * and on its own page. Decorative — the slug beside it is the name, so this
 * carries no text and no role.
 *
 * The hue reaches the stylesheet through `--h` on `style`: it is a value
 * computed at runtime from data, which is the one case inline `style` is for
 * (see quality-styling-tailwind); the gradient itself is the `swatch-gradient`
 * utility in `globals.css`.
 */
export function Swatch({ slug, size = "md", className }: SwatchProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "swatch-gradient block shrink-0 shadow-(--sh-2)",
        swatchSizes[size],
        className,
      )}
      style={{ "--h": slugToHue(slug) } as CSSProperties}
    />
  );
}
