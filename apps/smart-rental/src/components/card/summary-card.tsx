import type { LucideIcon } from "lucide-react";

import { Card, CardContent } from "@monorepo/ui/components/card";
import { cn } from "@monorepo/ui/utils/cn";

interface SummaryCardProps {
  label: string;
  value: string | number;
  /** One line under the number — "trên toàn bộ toà nhà". */
  description?: string;
  icon?: LucideIcon;
  iconClassName?: string;
  /** A number is a percent; a string is shown as written ("+12"). */
  trend?: { value: number | string; isPositive: boolean };
  className?: string;
}

/** One KPI: an icon tile, a label, a big number and an optional trend. */
export function SummaryCard({
  label,
  value,
  description,
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
                  trend.isPositive ? "text-success" : "text-destructive",
                )}
              >
                {trend.isPositive ? "↑" : "↓"}{" "}
                {typeof trend.value === "number"
                  ? `${Math.abs(trend.value)}%`
                  : trend.value}
              </span>
            )}
          </div>
          {description && (
            <p className="text-muted-foreground mt-0.5 text-xs">
              {description}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
