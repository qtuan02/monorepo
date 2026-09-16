import type { ComponentProps } from "react";

import { cn } from "@monorepo/ui/utils/cn";

interface GlassPanelProps extends ComponentProps<"div"> {
  /** Adds the fourth shadow — the lift a hero or a floating card gets. */
  deep?: boolean;
  /**
   * The element the panel is: a `div` unless the panel is itself a landmark
   * — a numbered `<section>` of Getting Started. Not Base UI's `render` prop,
   * because this is not a Base UI part and the app does not depend on the
   * package directly; a tag name is all the two callers need.
   */
  as?: "div" | "section";
}

/**
 * The content surface of the site (glossary: *Panel kính*): a translucent
 * panel that blurs the backdrop behind it — the `glass` utility from
 * `globals.css`, at the panel radius. It is meant for the handful of places
 * the aurora shows through — a tile is deliberately not one, since sixty
 * blurs on one screen is a GPU cost (brief §10 row 8).
 */
export function GlassPanel({
  deep,
  as: Tag = "div",
  className,
  ...props
}: GlassPanelProps) {
  return (
    <Tag
      data-slot="glass-panel"
      className={cn(
        "glass rounded-(--radius)",
        deep && "glass-deep",
        className,
      )}
      {...props}
    />
  );
}
