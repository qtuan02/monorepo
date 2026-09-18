import { Activity, ChevronRight } from "lucide-react";
import { Link } from "react-router";

import { buttonVariants } from "@monorepo/ui/components/button";
import {
  CardContent,
  CardFooter,
  CardHeader,
} from "@monorepo/ui/components/card";
import { cn } from "@monorepo/ui/utils/cn";

import type { Utility } from "~/types/utility";
import { StatusBadge } from "~/components/badge/status-badge";
import { EntityListCard } from "~/components/card/entity-list-card";
import { StatItem } from "~/components/card/stat-item";
import { ROUTES } from "~/constants/routes";
import { utilityStatusConfig, utilityTypeConfig } from "~/constants/status";
import { utilityUnit } from "~/features/utilities/utils/meter-reading";
import { formatMonth } from "~/utils/date";

interface UtilityCardProps {
  utility: Utility;
}

const accentByType = {
  electricity: "from-amber-400 via-amber-500 to-amber-400",
  water: "from-blue-400 via-blue-500 to-blue-400",
} as const;

export default function UtilityCard({ utility }: UtilityCardProps) {
  const type = utilityTypeConfig[utility.type];
  const TypeIcon = type.icon;

  return (
    <EntityListCard
      accentClassName={accentByType[utility.type]}
      header={
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "rounded-xl border p-2.5 shadow-sm [&_svg]:size-5",
                  type.className,
                )}
              >
                {TypeIcon && <TypeIcon />}
              </div>
              <div>
                <h3 className="font-bold leading-tight">{utility.roomName}</h3>
                <p className="text-muted-foreground text-xs">
                  {formatMonth(utility.month)}
                </p>
              </div>
            </div>
            <StatusBadge
              config={utilityStatusConfig[utility.status]}
              isCompact
            />
          </div>
        </CardHeader>
      }
      content={
        <CardContent>
          <dl className="bg-muted/40 ring-border/50 grid grid-cols-2 gap-3 rounded-xl p-3 ring-1">
            <StatItem
              label="Chỉ số cũ"
              value={utility.oldIndex}
              valueClassName="text-foreground/80 tabular-nums"
            />
            <StatItem
              label="Chỉ số mới"
              value={utility.newIndex}
              valueClassName="border-l pl-3 tabular-nums"
            />
          </dl>
          <div className="mt-4 flex items-center gap-2 border-t border-dashed pt-3">
            <div className={cn("rounded-full border p-1", type.className)}>
              <Activity className="size-3" />
            </div>
            <div className="flex flex-col">
              <span className="text-muted-foreground text-xs font-medium uppercase">
                Tiêu thụ
              </span>
              <span className="text-sm font-bold">
                {utility.consumption} {utilityUnit[utility.type]}
              </span>
            </div>
          </div>
        </CardContent>
      }
      footer={
        <CardFooter className="justify-end">
          <Link
            to={ROUTES.utilityDetailPath(utility.id)}
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "text-muted-foreground hover:text-primary",
            )}
          >
            Xem chi tiết
            <ChevronRight />
          </Link>
        </CardFooter>
      }
    />
  );
}
