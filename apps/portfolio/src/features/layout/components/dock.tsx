import type { ReactNode } from "react";

import { cn } from "@monorepo/ui/utils/cn";

interface DockProps {
  children: ReactNode;
  className?: string;
}

/**
 * The bar the dock's controls sit in: a square box with the page's hard edge
 * and its solid offset shadow, and nothing that moves.
 *
 * The v1 dock was the macOS bar — a `motion` value tracked the pointer along
 * it and a spring swelled whichever icon was underneath, which needed a context
 * so every icon could read the same pointer. The redesign takes all of that
 * out rather than flattening it: a hover changes a control's background, and
 * a control is the size it is. So this is a `<nav>` and a class string, with
 * no `"use client"` of its own — `navbar.template.tsx` is the client boundary,
 * for the tooltips and the theme button, and this renders inside it.
 *
 * `gap-2` is part of the contract, not the look: each control is 48px and the
 * gap keeps two of them at least 8px apart, so a thumb on a phone lands on one
 * (`e2e/dock.e2e.ts` measures both).
 */
export function Dock({ children, className }: DockProps) {
  return (
    <nav
      className={cn(
        "flex w-max items-center gap-2 border-2 border-border bg-background p-2 shadow-[4px_4px_0_0_var(--hard-shadow)]",
        className,
      )}
    >
      {children}
    </nav>
  );
}
