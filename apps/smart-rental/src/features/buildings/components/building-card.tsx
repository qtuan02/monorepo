import { ChevronRight } from "lucide-react";
import { Link } from "react-router";

import { buttonVariants } from "@monorepo/ui/components/button";
import {
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@monorepo/ui/components/card";
import { cn } from "@monorepo/ui/utils/cn";

import type { Building } from "~/types/building";
import { EntityListCard } from "~/components/card/entity-list-card";
import { StatItem } from "~/components/card/stat-item";
import OccupancyBar from "~/components/progress/occupancy-bar";
import { ROUTES } from "~/constants/routes";
import { getBuildingStats } from "~/features/buildings/utils/building-stats";

interface BuildingCardProps {
  building: Building;
}

export default function BuildingCard({ building }: BuildingCardProps) {
  const stats = getBuildingStats(building);

  return (
    <EntityListCard
      header={
        <CardHeader>
          <CardTitle className="text-lg">{building.name}</CardTitle>
          <CardDescription>{building.address}</CardDescription>
        </CardHeader>
      }
      content={
        <CardContent className="space-y-4">
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <StatItem label="Tổng phòng" value={stats.totalRooms} />
            <StatItem
              label="Phòng trống"
              value={stats.availableRooms}
              valueClassName="text-success"
            />
          </dl>
          <OccupancyBar rate={stats.occupancyRate} />
        </CardContent>
      }
      footer={
        <CardFooter className="justify-end">
          <Link
            to={ROUTES.buildingDetailPath(building.id)}
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
