import { Link } from "react-router";

import {
  CardContent,
  CardHeader,
  CardTitle,
} from "@monorepo/ui/components/card";

import type { BuildingView } from "~/types/building";
import { EntityListCard } from "~/components/card/entity-list-card";
import { StatGroup, StatItem } from "~/components/card/stat-item";
import { EntityActionMenu } from "~/components/menu/entity-action-menu";
import { OccupancyBar } from "~/components/progress/occupancy-bar";
import { ROUTES } from "~/constants/routes";

interface BuildingCardProps {
  building: BuildingView;
  onDelete?: () => void;
  canDelete?: boolean;
}

/**
 * One card of the "Quản lý Toà nhà" grid (round 4, #245): no more `h-32`
 * image band — Mock never sets `imageUrl`, so that band was a placeholder
 * tile for a feature nobody has yet. When a real photo lands, it becomes a
 * 40px avatar beside the name instead, so the card's height never changes
 * again. The whole card is a link — an invisible `Link` covers it
 * (`absolute inset-0`), with the `⋯` menu sitting above it in the header so
 * a click on neither navigates the other away. "Sửa" has no menu item —
 * editing is the detail screen's job (its own Sheet), reached by the card
 * link itself.
 */
export default function BuildingCard({
  building,
  onDelete,
  canDelete = true,
}: BuildingCardProps) {
  const detailPath = ROUTES.buildingDetailPath(building.id);

  return (
    <EntityListCard
      overlay={<Link to={detailPath} className="absolute inset-0 z-0" />}
      header={
        <CardHeader className="flex flex-row items-start justify-between gap-2">
          <div className="flex min-w-0 items-center gap-3">
            {building.imageUrl && (
              <img
                src={building.imageUrl}
                alt=""
                className="size-10 shrink-0 rounded-lg object-cover"
              />
            )}
            <div className="min-w-0">
              <CardTitle className="truncate text-base">
                {building.name}
              </CardTitle>
              <p className="text-muted-foreground truncate text-xs">
                {building.address}
              </p>
            </div>
          </div>
          <div className="relative z-10 shrink-0">
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
          </div>
        </CardHeader>
      }
      content={
        <CardContent className="space-y-3">
          <StatGroup className="sm:grid-cols-2 gap-3 text-sm">
            <StatItem label="Tổng phòng" value={building.totalRooms} />
            <StatItem
              label="Phòng trống"
              value={building.availableRooms}
              valueClassName="text-success"
            />
          </StatGroup>
          <OccupancyBar rate={building.occupancyRate} />
        </CardContent>
      }
    />
  );
}
