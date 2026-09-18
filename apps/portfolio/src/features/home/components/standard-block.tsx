import type { ComponentProps } from "react";

import { cn } from "@monorepo/ui/utils/cn";

/**
 * The one block shape this page is built from: a 2 px border in the border
 * token, a solid 4 px offset shadow in the shadow token, square corners, the
 * card background, and the page's own ink for text.
 *
 * A component rather than a className constant because the block is a *shape*
 * several files have to agree on — the hero's terminal window, every work
 * row, the education row, About, each project card, the skills, the contact
 * and hobby blocks: seven callers — not a measurement two siblings share. Written out per call site, the copies
 * would drift the first time one of them was "tidied"; here the shape is one
 * file, and a block that stops using it is a diff anyone can read.
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
 *   card's foreground is the shared theme's, and this app overrides only
 *   `--foreground` — the block paints on `bg-card` with the page's ink, and
 *   #114 measured that pair in both themes.
 * - `print:border print:shadow-none`: on paper the shadow is ink spent on
 *   nothing — and whether it shows at all is a checkbox in the reader's
 *   dialog — while a 2px rule around every paragraph is a box, not an edge.
 *   So the block prints flat, with the 1px edge a shared control draws. The
 *   print half of the shape lives here with the screen half, not in the
 *   `@media print` block of `globals.css`, for the reason this file exists at
 *   all: one place. `e2e/print-and-motion.e2e.ts` measures it.
 *
 * The press is the one behaviour the block has: under the cursor it sinks by
 * half a step toward its shadow and the shadow shortens to match, so the block
 * reads as pushed into the page rather than lifted off it — the neubrutalist
 * hover, and the opposite of v1's lift. Every block presses, the hero and the
 * static ones included: #123 first limited it to the blocks a reader can act
 * on, and the owner asked for the whole page to answer the cursor (#124) — on
 * this page the press is texture, not an affordance, and the links inside a
 * block still say what is clickable. Transform and shadow only, so nothing
 * around it reflows; `motion-reduce:transition-none` keeps the state and drops
 * the tween. `shadow-hard-pressed` is the 2 px sibling of `shadow-hard`,
 * declared beside it in `globals.css`; `print:` undoes the translate because
 * a print preview can be hovered.
 *
 * The padding is the block's too — `p-4 sm:p-5` — because every caller chose
 * the same one and a block whose inset differed from its neighbours' would
 * read as a different block; `cn` lets a caller override it, which the hero
 * does (`p-0 sm:p-0` — one per breakpoint, since `twMerge` replaces a
 * utility only under the same variant): its title bar runs edge to edge and
 * its body carries its own. Layout and
 * everything else are the caller's: a work row lays a logo beside a column, a
 * project card stacks a header over a footer, and neither arrangement belongs
 * to the shape they share.
 */
export default function StandardBlock({
  className,
  ...props
}: ComponentProps<"div">) {
  return (
    <div
      data-slot="standard-block"
      className={cn(
        "rounded-none border-2 border-border bg-card p-4 text-foreground shadow-hard transition-[translate,box-shadow,background-color] duration-150 ease-out hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-hard-pressed sm:p-5 motion-reduce:transition-none print:border print:shadow-none print:hover:translate-x-0 print:hover:translate-y-0",
        className,
      )}
      {...props}
    />
  );
}
