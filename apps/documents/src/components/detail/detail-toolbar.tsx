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
  "bg-(--glass-strong) text-foreground/80 hover:bg-card hover:text-foreground focus-visible:ring-ring/50 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 font-mono text-[12.5px] outline-none focus-visible:ring-[3px]";

/**
 * The glass strip above a detail page's hero: where the page sits
 * (`Component / dialog`) and the two neighbours in the Catalogue's own order.
 * With no sidebar these two buttons and the search palette are the whole way
 * between the pages, so a missing neighbour is simply not rendered rather than
 * wrapped to the other end — the list has a first page and a last one.
 */
export function DetailToolbar({
  section,
  slug,
  prev,
  next,
}: DetailToolbarProps) {
  return (
    <div className="glass mb-7 inline-flex max-w-full flex-wrap items-center gap-2 rounded-full py-2 pr-2 pl-4 text-[13.5px]">
      <span className="text-muted-foreground">
        {section} /{" "}
        <b className="text-foreground font-mono font-semibold">{slug}</b>
      </span>

      {(prev || next) && (
        <span className="ml-3 flex gap-1">
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
