import { Link } from "react-router";

import { CardContent, CardHeader } from "@monorepo/ui/components/card";

import type { RoomView } from "~/types/room";
import { StatusBadge } from "~/components/badge/status-badge";
import { EntityListCard } from "~/components/card/entity-list-card";
import { ROUTES } from "~/constants/routes";
import { roomStatusConfig, roomTypeConfig } from "~/constants/status";
import { formatCurrency } from "~/utils/currency";
import RoomRowActions from "./room-row-actions";

interface RoomGridProps {
  rooms: RoomView[];
  /**
   * Present only at Building scope null ("Tất cả Toà nhà") — one more
   * grouping layer above tầng, a title per Toà nhà (spec #179 §"Danh sách và
   * Phòng"). Absent at a single Toà nhà's own scope, where the tầng headings
   * already say enough.
   */
  buildingNameById?: Map<string, string>;
}

/** Groups by floor, highest first; each floor's Phòng by name. */
function groupByFloor(rooms: RoomView[]) {
  const byFloor = new Map<number, RoomView[]>();
  for (const room of rooms) {
    const floor = room.floor || 1;
    byFloor.set(floor, [...(byFloor.get(floor) ?? []), room]);
  }
  return [...byFloor.entries()]
    .sort(([a], [b]) => b - a)
    .map(([floor, floorRooms]) => ({
      floor,
      rooms: [...floorRooms].sort((a, b) => a.name.localeCompare(b.name)),
    }));
}

/** Groups by Toà nhà, by name; each Toà nhà's Phòng grouped by floor in turn. */
function groupByBuilding(
  rooms: RoomView[],
  buildingNameById: Map<string, string>,
) {
  const byBuilding = new Map<string, RoomView[]>();
  for (const room of rooms) {
    byBuilding.set(room.buildingId, [
      ...(byBuilding.get(room.buildingId) ?? []),
      room,
    ]);
  }
  return [...byBuilding.entries()]
    .map(([buildingId, buildingRooms]) => ({
      buildingId,
      buildingName: buildingNameById.get(buildingId) ?? buildingId,
      floors: groupByFloor(buildingRooms),
    }))
    .sort((a, b) => a.buildingName.localeCompare(b.buildingName));
}

function FloorSection({ floor, rooms }: { floor: number; rooms: RoomView[] }) {
  return (
    <section className="space-y-4">
      <div className="bg-background sticky top-0 z-10 flex items-center gap-4 py-1">
        <h2 className="text-foreground/80 text-lg font-semibold tracking-tight">
          Tầng {floor}
        </h2>
        <div className="bg-border h-px flex-1" />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {rooms.map((room) => {
          const status = roomStatusConfig[room.status];
          // Badge only when the room ISN'T "Đã thuê" — an occupied room with
          // no other signal says nothing extra (spec #153 §3.3); Trống/Bảo
          // trì/Đã đặt each get their own status.
          const showBadge = room.status !== "occupied";
          const meta = [
            roomTypeConfig[room.type].label,
            `${room.area} m²`,
            room.tenant,
          ]
            .filter(Boolean)
            .join(" · ");

          return (
            <EntityListCard
              key={room.id}
              className="gap-1.5 py-3"
              overlay={
                <Link
                  to={ROUTES.roomDetailPath(room.id)}
                  className="absolute inset-0 z-0"
                />
              }
              header={
                <CardHeader className="flex flex-row items-start justify-between gap-2 px-3">
                  <h3 className="truncate text-[15px] leading-none font-semibold">
                    {room.name}
                  </h3>
                  <div className="relative z-10 shrink-0">
                    <RoomRowActions room={room} side="top" />
                  </div>
                </CardHeader>
              }
              content={
                <CardContent className="gap-1 px-3">
                  <p className="text-muted-foreground truncate text-xs">
                    {meta}
                  </p>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold">
                      {formatCurrency(room.price)}
                    </span>
                    {showBadge && <StatusBadge config={status} isCompact />}
                  </div>
                </CardContent>
              }
            />
          );
        })}
      </div>
    </section>
  );
}

/**
 * The card view of the Phòng list, by floor — the whole scope, never a page
 * (spec #153 §10 row 43): `DataTable`'s `paginate={false}` hands it every
 * filtered row, and the `h2` per floor stays visible while its rows scroll by.
 * At Building scope null, `buildingNameById` adds a Toà nhà title above each
 * of its own floor groups (spec #179 §"Danh sách và Phòng").
 */
export default function RoomGrid({ rooms, buildingNameById }: RoomGridProps) {
  if (buildingNameById) {
    return (
      <div className="space-y-10">
        {groupByBuilding(rooms, buildingNameById).map(
          ({ buildingId, buildingName, floors }) => (
            <section key={buildingId} className="space-y-6">
              <h2 className="text-xl font-bold tracking-tight">
                {buildingName}
              </h2>
              <div className="space-y-8">
                {floors.map(({ floor, rooms: floorRooms }) => (
                  <FloorSection key={floor} floor={floor} rooms={floorRooms} />
                ))}
              </div>
            </section>
          ),
        )}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {groupByFloor(rooms).map(({ floor, rooms: floorRooms }) => (
        <FloorSection key={floor} floor={floor} rooms={floorRooms} />
      ))}
    </div>
  );
}
