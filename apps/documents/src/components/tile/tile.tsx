import type { ReactNode } from "react";
import { Link } from "react-router";

import { cn } from "@monorepo/ui/utils/cn";

import { Swatch } from "~/components/swatch/swatch";

interface TileProps {
  to: string;
  slug: string;
  /** The number in the corner — a primitive's export count. A hook has one export, so it shows none. */
  count?: number;
  /** Two columns from `md` — the list decides from its data, never by hand. */
  wide?: boolean;
  /** The line(s) under the slug: an export preview, a hook's sentence. */
  children: ReactNode;
}

/**
 * One entry in a list grid (glossary: *Tile*): swatch, slug, a line of
 * content and the count in the corner, on the `tile` surface from
 * `globals.css` — opaque enough to need no blur, unlike a `GlassPanel`.
 *
 * The slug comes first in the DOM so it leads the link's accessible name;
 * the swatch is decorative and the count is last. Hover lifts three pixels
 * and adds the fourth shadow; the lift is `motion-safe` so reduced-motion
 * keeps only the shadow.
 *
 * The tile renders its own `<li>`, because that is the grid item: a column
 * span on the link inside it would never reach the grid.
 */
export function Tile({ to, slug, count, wide, children }: TileProps) {
  return (
    <li className={cn(wide && "md:col-span-2")}>
      <Link
        to={to}
        className="tile focus-visible:ring-ring/50 relative flex h-full min-h-29.5 flex-col rounded-(--radius) p-4 pb-3.5 outline-none hover:glass-deep focus-visible:ring-2 motion-safe:transition-[transform,box-shadow] motion-safe:duration-200 motion-safe:hover:-translate-y-0.75"
      >
        <Swatch slug={slug} className="mb-3" />
        <span className="font-mono text-sm font-semibold">{slug}</span>
        {children}
        {count !== undefined && (
          <span className="bg-(--tile) text-muted-foreground absolute top-3.5 right-3.5 rounded-full px-2 py-0.5 font-mono text-[11px] font-semibold tabular-nums">
            {count}
          </span>
        )}
      </Link>
    </li>
  );
}
