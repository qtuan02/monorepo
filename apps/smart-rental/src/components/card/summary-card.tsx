import type { LucideIcon } from "lucide-react";

import { Card, CardContent } from "@monorepo/ui/components/card";
import { cn } from "@monorepo/ui/utils/cn";

interface SummaryCardProps {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  iconClassName?: string;
  trend?: { value: number; isPositive: boolean };
  className?: string;
}

/** One KPI: an icon tile, a label, a big number and an optional trend. */
export function SummaryCard({
  label,
  value,
  icon: Icon,
  iconClassName = "bg-primary/10 text-primary",
  trend,
  className,
}: SummaryCardProps) {
  return (
    <Card size="sm" className={className}>
      <CardContent className="flex items-center gap-3">
        {Icon && (
          <div
            className={cn(
              "flex size-9 shrink-0 items-center justify-center rounded-lg [&_svg]:size-4",
              iconClassName,
            )}
          >
            <Icon />
          </div>
        )}
        <div className="flex-1">
          <p className="text-muted-foreground text-xs">{label}</p>
          <div className="flex items-end gap-2">
            <p className="text-xl font-bold tabular-nums">{value}</p>
            {trend && (
              <span
                className={cn(
                  "text-xs font-semibold",
                  trend.isPositive ? "text-emerald-600" : "text-red-600",
                )}
              >
                {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}%
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
