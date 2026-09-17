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
