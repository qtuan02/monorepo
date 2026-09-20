import type { ComponentProps } from "react";

import { cn } from "@monorepo/ui/utils/cn";

/**
 * The one shape every visible surface of this app sits on (CONTEXT.md,
 * ADR-0016) — a translucent card floating on the gradient `body` paints,
 * bo 22px, no `backdrop-filter`: the gradient is flat enough that opacity
 * alone reads as glass, and two of these carry a continuously-scrolling
 * Virtuoso list (`styles#3` calls blur "performance-limited").
 */
export function Island({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn("bg-card/75 rounded-[1.375rem] shadow-sm", className)}
      {...props}
    />
  );
}
