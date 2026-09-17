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
  "bg-card ring-foreground/10 flex divide-x divide-border overflow-x-auto rounded-xl shadow-xs ring-1";

/**
 * One KPI strip, two sizes from one markup (spec #153 §10 row 16): each item
 * carries `min-w-[150px]` and `flex-1`, so a desktop-width container lets
 * every item share the space evenly while a narrow one overflows into a
 * horizontal scroll — no separate mobile layout to keep in sync.
 */
export function KpiStrip({ items, className }: KpiStripProps) {
  return (
    <div data-slot="kpi-strip" className={cn(STRIP_CLASSNAME, className)}>
      {items.map((item) => (
        <div key={item.label} className="min-w-[150px] flex-1 p-4">
          <p className="text-muted-foreground text-xs font-medium">
            {item.label}
          </p>
          <div className="mt-1 flex items-baseline gap-1.5">
            <p className="text-xl font-bold tabular-nums">{item.value}</p>
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
      {SKELETON_TILES.slice(0, count).map((tile) => (
        <div key={tile} className="min-w-[150px] flex-1 space-y-2 p-4">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-6 w-20" />
        </div>
      ))}
    </div>
  );
}
