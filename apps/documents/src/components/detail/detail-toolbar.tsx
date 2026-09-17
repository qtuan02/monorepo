import { ArrowLeft, ArrowRight } from "lucide-react";
import { Link } from "react-router";

import { cn } from "@monorepo/ui/utils/cn";

export interface DetailNeighbour {
  slug: string;
  to: string;
  /** The accessible name — "Trước: date-picker"; the visible text is the slug alone. */
  label: string;
}

interface DetailToolbarProps {
  /** The section the page belongs to — "Component" or "Hook". */
  section: string;
  slug: string;
  prev?: DetailNeighbour;
  next?: DetailNeighbour;
}

const neighbourClassName =
  "glass text-foreground/80 hover:bg-card hover:text-foreground focus-visible:ring-ring/50 inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 font-mono text-[12.5px] outline-none focus-visible:ring-[3px]";

/**
 * The strip above a detail page's hero, in two halves pushed to the two
 * edges: where the page sits (`Component / dialog`) on the left, and the two
 * neighbours in the Catalogue's own order on the right, each its own glass
 * pill. With no sidebar these two buttons and the search palette are the
 * whole way between the pages, so a missing neighbour is simply not rendered
 * rather than wrapped to the other end — the list has a first page and a
 * last one.
 */
export function DetailToolbar({
  section,
  slug,
  prev,
  next,
}: DetailToolbarProps) {
  return (
    <div className="mb-7 flex flex-wrap items-center justify-between gap-2 text-[13.5px]">
      <span className="glass text-muted-foreground inline-flex items-center rounded-full px-4 py-2">
        {section} /{" "}
        <b className="text-foreground ml-1 font-mono font-semibold">{slug}</b>
      </span>

      {(prev || next) && (
        <span className="ml-auto flex gap-1.5">
          {prev && (
            <Link
              to={prev.to}
              aria-label={prev.label}
              className={neighbourClassName}
            >
              <ArrowLeft className="size-3.5" />
              {prev.slug}
            </Link>
          )}
          {next && (
            <Link
              to={next.to}
              aria-label={next.label}
              className={cn(neighbourClassName, "flex-row-reverse")}
            >
              <ArrowRight className="size-3.5" />
              {next.slug}
            </Link>
          )}
        </span>
      )}
    </div>
  );
}
