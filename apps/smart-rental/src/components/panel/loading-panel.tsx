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

interface LoadingPanelProps {
  /** At most ten. */
  itemCount?: number;
  className?: string;
}

/** A grid of card-shaped skeletons; the caller overrides the columns via `className`. */
export function LoadingPanel({ itemCount = 6, className }: LoadingPanelProps) {
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
 * tabs layout skeletons its own shape instead of `LoadingPanel`'s card grid.
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
