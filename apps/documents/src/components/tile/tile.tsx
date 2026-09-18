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
 *
 * Below `sm` it is a **row** instead of a column — swatch left, slug +
 * content stacked in the middle, count at the end — so the phone list is a
 * head-to-toe scan instead of ~9 000px of stacked squares. One DOM for every
 * breakpoint: the direction flips with `sm:flex-col`, nothing is rendered
 * twice. `max-sm:truncate` keeps the slug one line at row height; from `sm`
 * it wraps at a hyphen exactly as it does at 1024 today.
 */
export function Tile({ to, slug, count, wide, children }: TileProps) {
  return (
    <li className={cn(wide && "md:col-span-2")}>
      <Link
        to={to}
        className="tile focus-visible:ring-ring/50 relative flex h-full flex-row items-center gap-3 rounded-(--radius) p-4 pb-3.5 outline-none hover:glass-deep focus-visible:ring-2 motion-safe:transition-[transform,box-shadow] motion-safe:duration-200 motion-safe:hover:-translate-y-0.75 sm:min-h-29.5 sm:flex-col sm:items-stretch sm:gap-0"
      >
        <Swatch slug={slug} className="mb-3 max-sm:mb-0" />
        {/* `flex-col` (not just a block) so the slug and the preview stay
            flex items of it — the same auto-blockify that makes `truncate`
            hold on Link's own flex children at `sm`+ today. */}
        <span className="flex min-w-0 flex-1 flex-col sm:contents">
          <span className="font-mono text-sm font-semibold max-sm:truncate">
            {slug}
          </span>
          {children}
        </span>
        {count !== undefined && (
          <span className="bg-(--tile) text-muted-foreground absolute top-3.5 right-3.5 rounded-full px-2 py-0.5 font-mono text-[11px] font-semibold tabular-nums max-sm:static max-sm:ml-auto">
            {count}
          </span>
        )}
      </Link>
    </li>
  );
}
