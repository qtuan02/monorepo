"use client";

import type { ComponentPropsWithRef } from "react";

import { Button } from "@monorepo/ui/components/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@monorepo/ui/components/tooltip";
import { cn } from "@monorepo/ui/utils/cn";

type TooltipIconButtonProps = ComponentPropsWithRef<typeof Button> & {
  tooltip: string;
  side?: "top" | "bottom" | "left" | "right";
};

/**
 * An icon-only button whose label lives in a tooltip **and** in a visually
 * hidden span, so a screen reader announces it and Playwright can address it by
 * accessible name.
 *
 * Base UI composes through `render` rather than Radix's `asChild`, which is why
 * the Button is handed to the trigger as an element instead of wrapped by it —
 * and why the `Slottable` the app this replaced needed is gone.
 */
export function TooltipIconButton({
  children,
  tooltip,
  side = "bottom",
  className,
  ...rest
}: TooltipIconButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            aria-label={tooltip}
            {...rest}
            className={cn("size-6 p-1", className)}
          >
            {children}
          </Button>
        }
      />
      <TooltipContent side={side}>{tooltip}</TooltipContent>
    </Tooltip>
  );
}
