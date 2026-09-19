import { Skeleton } from "@monorepo/ui/components/skeleton";
import { cn } from "@monorepo/ui/utils/cn";

// Named tiles rather than `Array.from((_, i) => …)`: a placeholder has no id
// of its own, and an index key is the one shape the list-key rule bans.
const TILES = [
  "first",
  "second",
  "third",
  "fourth",
  "fifth",
  "sixth",
  "seventh",
  "eighth",
  "ninth",
  "tenth",
] as const;

interface CardGridSkeletonProps {
  /** At most ten. */
  itemCount?: number;
  className?: string;
}

/** The card-grid footprint — a list screen whose default view is cards. */
export function CardGridSkeleton({
  itemCount = 6,
  className,
}: CardGridSkeletonProps) {
  return (
    <div className={cn("grid gap-4 sm:grid-cols-2 lg:grid-cols-3", className)}>
      {TILES.slice(0, itemCount).map((tile) => (
        <div
          key={`loading-tile-${tile}`}
          className="space-y-3 rounded-lg border p-4"
        >
          <Skeleton className="size-12 rounded-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      ))}
    </div>
  );
}

/**
 * A detail screen's own footprint (spec #153 §3.4): the header-entity row,
 * a tabs bar, a two-column body — so a screen that adopts `DetailPageShell`'s
 * tabs layout skeletons its own shape instead of `CardGridSkeleton`'s card grid.
 */
export function DetailSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-8 w-24" />
      </div>
      <Skeleton className="h-9 w-64" />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-3 lg:col-span-2">
          <Skeleton className="h-40 w-full rounded-lg" />
        </div>
        <Skeleton className="h-40 w-full rounded-lg" />
      </div>
    </div>
  );
}

interface TableSkeletonProps {
  rows?: number;
  /** Cells per row — a `DataTable` passes its own `columns.length`. */
  columnCount?: number;
  className?: string;
}

/**
 * The bordered-table footprint — a list screen whose default view is a
 * table. Row heights (`h-9` header / `h-11` body) match the real table's own
 * `[&_thead_th]:h-9 [&_tbody_td]:h-11` (round 4 Q3/Q4, 44 px rows).
 */
export function TableSkeleton({
  rows = 5,
  columnCount = 3,
  className,
}: TableSkeletonProps) {
  const cells = Array.from({ length: columnCount }, (_, i) => i);

  return (
    <div className={cn("overflow-hidden rounded-md border", className)}>
      <div
        data-slot="table-skeleton-row"
        className="bg-muted/40 flex h-9 items-center gap-4 border-b px-4"
      >
        {cells.map((cell) => (
          <Skeleton
            key={`loading-header-cell-${cell}`}
            className="h-4 flex-1"
          />
        ))}
      </div>
      {TILES.slice(0, rows).map((tile) => (
        <div
          key={`loading-row-${tile}`}
          data-slot="table-skeleton-row"
          className="flex h-11 items-center gap-4 border-b px-4 last:border-0"
        >
          {cells.map((cell) => (
            <Skeleton key={`loading-cell-${cell}`} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}
