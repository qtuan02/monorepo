import { ArrowLeft, ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";

import { cn } from "@monorepo/ui/utils/cn";

interface DetailToolbarProps {
  /** The section the page belongs to — "Component" or "Hook". */
  section: string;
  slug: string;
  /** The entries either side in the Catalogue — `catalogueNeighbours`' answer. */
  prev?: { slug: string };
  next?: { slug: string };
  /** `ROUTES.componentBySlugPath` or its hook twin — never an interpolated path. */
  buildPath: (slug: string) => string;
}

const neighbourClassName =
  "tile text-foreground/80 hover:bg-card hover:text-foreground focus-visible:ring-ring/50 inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 font-mono text-[12.5px] outline-none focus-visible:ring-[3px]";

/**
 * The strip above a detail page's hero, in two halves pushed to the two
 * edges: where the page sits (`Component / dialog`) on the left, and the two
 * neighbours in the Catalogue's own order on the right, each its own pill on
 * the `tile` surface — no blur, since the hero right under them is one of the
 * five glass surfaces the brief allows (§10 row 8). With no sidebar these two
 * buttons and the search palette are the whole way between the pages, so a
 * missing neighbour is simply not rendered rather than wrapped to the other
 * end — the list has a first page and a last one. The accessible name is
 * "Trước: date-picker"; the visible text is the slug alone.
 */
export function DetailToolbar({
  section,
  slug,
  prev,
  next,
  buildPath,
}: DetailToolbarProps) {
  const { t } = useTranslation();

  return (
    <div className="mb-7 flex flex-wrap items-center justify-between gap-2 text-[13.5px]">
      <span className="tile text-muted-foreground inline-flex items-center rounded-full px-4 py-2">
        {section} /{" "}
        <b className="text-foreground ml-1 font-mono font-semibold">{slug}</b>
      </span>

      {(prev || next) && (
        <span className="ml-auto flex gap-1.5">
          {prev && (
            <Link
              to={buildPath(prev.slug)}
              aria-label={t("documents.detail.prev", { slug: prev.slug })}
              className={neighbourClassName}
            >
              <ArrowLeft className="size-3.5" />
              {prev.slug}
            </Link>
          )}
          {next && (
            <Link
              to={buildPath(next.slug)}
              aria-label={t("documents.detail.next", { slug: next.slug })}
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
