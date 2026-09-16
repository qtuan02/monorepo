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
import { ROUTES } from "~/constants/routes";
import { getBuildingStats } from "~/features/buildings/utils/building-stats";
import OccupancyBar from "./occupancy-bar";

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
            <div>
              <dt className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
                Tổng phòng
              </dt>
              <dd className="mt-1.5 text-base font-semibold">
                {stats.totalRooms}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
                Phòng trống
              </dt>
              <dd className="mt-1.5 text-base font-semibold text-emerald-700">
                {stats.availableRooms}
              </dd>
            </div>
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
