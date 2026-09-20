import type { ReactNode } from "react";

import { cn } from "@monorepo/ui/utils/cn";

interface DockProps {
  children: ReactNode;
  className?: string;
}

/**
 * The bar the dock's controls sit in: from `sm` up, a square box with the
 * page's hard edge and its solid offset shadow, pressing under the cursor the
 * way every block on the page does — `shadow-hard` to `shadow-hard-pressed`
 * with a 2px translate, the same two utilities `standard-block.tsx` uses
 * (#124; the dock spelled its own shadow before). What does *not* move on
 * hover is a control inside it: the bar answers the cursor, a control answers
 * the click — see `dockControlClassName` in `navbar.template.tsx`.
 *
 * Below `sm` it is a **Thanh chạm đáy** instead (spec #210/#211): full-width,
 * flush with the bottom edge, only its top edge drawn, no shadow, and no
 * press on hover — a full-width bar sinking 2px would open a gap at its own
 * edge. A control inside it still sinks 1px on `:active`; only the bar's own
 * hover-press is gone. One `<nav>`, one class string — never a second "mobile
 * dock" component.
 *
 * `gap-2` is part of the contract, not the look: each control is 48px and the
 * gap keeps two of them at least 8px apart, so a thumb on a phone lands on one
 * (`e2e/dock.e2e.ts` measures both).
 */
export default function Dock({ children, className }: DockProps) {
  return (
    <nav
      className={cn(
        "flex w-full items-center justify-between gap-2 border-t-2 border-border bg-background p-2 shadow-none transition-[translate,box-shadow] duration-150 ease-out motion-reduce:transition-none sm:w-max sm:justify-start sm:border-2 sm:shadow-hard sm:hover:translate-x-0.5 sm:hover:translate-y-0.5 sm:hover:shadow-hard-pressed",
        className,
      )}
    >
      {children}
    </nav>
  );
}
