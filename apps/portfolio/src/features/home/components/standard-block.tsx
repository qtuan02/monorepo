import type { ComponentProps } from "react";

import { cn } from "@monorepo/ui/utils/cn";

/**
 * The one block shape this page is built from: a 2 px border in the border
 * token, a solid 4 px offset shadow in the shadow token, square corners, the
 * card background, and the page's own ink for text.
 *
 * A component rather than a className constant because the block is a *shape*
 * several files have to agree on — every work row, and after it the project
 * cards, the skills, the contact and hobby blocks — not a measurement two
 * siblings share. Written out per call site, the seven copies would drift the
 * first time one of them was "tidied"; here the shape is one file, and a block
 * that stops using it is a diff anyone can read.
 *
 * Why each utility is what it is:
 *
 * - `border-2`, not the primitives' `border`: the design keeps two thicknesses
 *   on purpose — a shared control (badge, button, select) at 1 px, a block of
 *   the page at 2 px — and this is the 2 px half.
 * - `shadow-hard` is the app's own `@theme` entry in `globals.css`, `4px 4px
 *   0 0` in `--hard-shadow`, so the light/dark swap of that token reaches the
 *   shadow and no call site spells the offset.
 * - `rounded-none` is stated even though `--radius: 0px` already squares every
 *   `rounded-*` on the page: a block reads as square in its own file, not by
 *   way of a token declared elsewhere.
 * - `text-foreground` rather than inheriting or `text-card-foreground`: the
 *   card's own foreground is still the shared theme's blue-grey, which is
 *   exactly the text the redesign got rid of — the block paints on `bg-card`
 *   with the page's ink, and #114 measured that pair in both themes.
 *
 * Padding, layout and everything else are the caller's: a work row lays a logo
 * beside a column, a project card stacks a header over a footer, and neither
 * arrangement belongs to the shape they share.
 */
export default function StandardBlock({
  className,
  ...props
}: ComponentProps<"div">) {
  return (
    <div
      data-slot="standard-block"
      className={cn(
        "rounded-none border-2 border-border bg-card text-foreground shadow-hard",
        className,
      )}
      {...props}
    />
  );
}
