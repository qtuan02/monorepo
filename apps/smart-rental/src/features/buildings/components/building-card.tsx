import { Building2 } from "lucide-react";
import { Link } from "react-router";

import {
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@monorepo/ui/components/card";

import type { Building } from "~/types/building";
import { EntityListCard } from "~/components/card/entity-list-card";
import { StatGroup, StatItem } from "~/components/card/stat-item";
import { EntityActionMenu } from "~/components/menu/entity-action-menu";
import OccupancyBar from "~/components/progress/occupancy-bar";
import { ROUTES } from "~/constants/routes";
import { getBuildingStats } from "~/features/buildings/utils/building-stats";

interface BuildingCardProps {
  building: Building;
  onDelete?: () => void;
  canDelete?: boolean;
}

/**
 * One card of the "Quản lý Toà nhà" grid (spec #153 §3.3): an image or
 * fallback tile, and the whole card is a link — an invisible `Link` covers
 * it (`absolute inset-0`), with the `⋯` menu sitting above it so a click on
 * neither navigates the other away. "Sửa" has no menu item — editing is the
 * detail screen's job (its own Sheet), reached by the card link itself.
 */
export default function BuildingCard({
  building,
  onDelete,
  canDelete = true,
}: BuildingCardProps) {
  const stats = getBuildingStats(building);
  const detailPath = ROUTES.buildingDetailPath(building.id);

  return (
    <EntityListCard
      className="overflow-hidden pt-0"
      header={
        <div className="bg-muted relative flex h-32 w-full items-center justify-center overflow-hidden">
          {building.imageUrl ? (
            <img
              src={building.imageUrl}
              alt=""
              className="size-full object-cover"
            />
          ) : (
            <Building2 className="text-muted-foreground size-10" />
          )}
        </div>
      }
      content={
        <>
          <CardHeader>
            <CardTitle className="text-lg">{building.name}</CardTitle>
            <CardDescription>{building.address}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <StatGroup className="sm:grid-cols-2 gap-3 text-sm">
              <StatItem label="Tổng phòng" value={stats.totalRooms} />
              <StatItem
                label="Phòng trống"
                value={stats.availableRooms}
                valueClassName="text-success"
              />
            </StatGroup>
            <OccupancyBar rate={stats.occupancyRate} />
          </CardContent>
        </>
      }
      footer={
        <CardFooter className="relative z-10 justify-between">
          <span className="text-muted-foreground text-xs">Xem chi tiết</span>
          <EntityActionMenu
            label={`Thao tác với ${building.name}`}
            items={[
              {
                key: "delete",
                label: canDelete
                  ? "Xóa"
                  : "Xóa (còn phòng có hợp đồng hiệu lực)",
                isDestructive: true,
                onClick: canDelete ? onDelete : undefined,
              },
            ]}
          />
        </CardFooter>
      }
      overlay={<Link to={detailPath} className="absolute inset-0 z-0" />}
    />
  );
}
