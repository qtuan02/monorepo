import type { ReactNode } from "react";

import { Skeleton } from "@monorepo/ui/components/skeleton";
import { cn } from "@monorepo/ui/utils/cn";

export interface KpiItemData {
  label: string;
  value: ReactNode;
  description?: string;
  trend?: { value: number | string; isPositive: boolean };
}

interface KpiStripProps {
  items: KpiItemData[];
  className?: string;
}

const STRIP_CLASSNAME =
  "bg-card ring-foreground/10 grid grid-cols-2 gap-px overflow-hidden rounded-xl shadow-xs ring-1 sm:flex sm:gap-0 sm:divide-x sm:divide-border sm:overflow-x-auto";

/** The last of an odd item count spans both mobile columns instead of leaving a hole. */
function isFullWidthOnMobile(index: number, count: number) {
  return count % 2 === 1 && index === count - 1;
}

/**
 * One KPI strip, two layouts from one markup (round 4, #245): a `sm:` flex
 * row with `min-w-[150px]`/`flex-1` items — same shape as before — and below
 * `sm` a `grid-cols-2` so all tiles read at a glance instead of a horizontal
 * scroll that cut the strip off. An odd tile count spans its last item full
 * width on the grid so it never sits alone in a half-empty row.
 */
export function KpiStrip({ items, className }: KpiStripProps) {
  return (
    <div data-slot="kpi-strip" className={cn(STRIP_CLASSNAME, className)}>
      {items.map((item, index) => (
        <div
          key={item.label}
          className={cn(
            "bg-card p-3 sm:min-w-[150px] sm:flex-1",
            isFullWidthOnMobile(index, items.length) &&
              "col-span-2 sm:col-span-1",
          )}
        >
          <p className="text-muted-foreground text-xs font-medium">
            {item.label}
          </p>
          <div className="mt-1 flex items-baseline gap-1.5">
            <p className="text-lg font-semibold tabular-nums">{item.value}</p>
            {item.trend && (
              <span
                className={cn(
                  "text-xs font-semibold",
                  item.trend.isPositive ? "text-success" : "text-destructive",
                )}
              >
                {item.trend.isPositive ? "▲" : "▼"}{" "}
                {typeof item.trend.value === "number"
                  ? `${Math.abs(item.trend.value)}%`
                  : item.trend.value}
              </span>
            )}
          </div>
          {item.description && (
            <p className="text-muted-foreground mt-0.5 text-xs">
              {item.description}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

// Named tiles rather than an index — a skeleton tile has no id of its own,
// and an index key is the one shape the list-key rule bans.
const SKELETON_TILES = ["first", "second", "third", "fourth"] as const;

/** The strip's own footprint, so the layout does not jump once data lands. */
export function KpiStripSkeleton({
  count = 4,
  className,
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div
      data-slot="kpi-strip-skeleton"
      className={cn(STRIP_CLASSNAME, className)}
    >
      {SKELETON_TILES.slice(0, count).map((tile, index) => (
        <div
          key={tile}
          className={cn(
            "space-y-2 p-3 sm:min-w-[150px] sm:flex-1",
            isFullWidthOnMobile(index, count) && "col-span-2 sm:col-span-1",
          )}
        >
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-5 w-20" />
        </div>
      ))}
    </div>
  );
}
