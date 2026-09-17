import { User } from "lucide-react";
import { Link } from "react-router";

import {
  CardContent,
  CardFooter,
  CardHeader,
} from "@monorepo/ui/components/card";

import type { Room } from "~/types/room";
import { StatusBadge } from "~/components/badge/status-badge";
import { EntityListCard } from "~/components/card/entity-list-card";
import { ROUTES } from "~/constants/routes";
import { roomStatusConfig, roomTypeConfig } from "~/constants/status";
import { formatCurrency } from "~/utils/currency";
import RoomRowActions from "./room-row-actions";

interface RoomGridProps {
  rooms: Room[];
}

/** Groups by floor, highest first; each floor's Phòng by name. */
function groupByFloor(rooms: Room[]) {
  const byFloor = new Map<number, Room[]>();
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

/**
 * The card view of the Phòng list, by floor — the whole scope, never a page
 * (spec #153 §10 row 43): `DataTable`'s `paginate={false}` hands it every
 * filtered row, and the `h2` per floor stays visible while its rows scroll by.
 */
export default function RoomGrid({ rooms }: RoomGridProps) {
  return (
    <div className="space-y-8">
      {groupByFloor(rooms).map(({ floor, rooms: floorRooms }) => (
        <section key={floor} className="space-y-4">
          <div className="bg-background sticky top-0 z-10 flex items-center gap-4 py-1">
            <h2 className="text-foreground/80 text-lg font-semibold tracking-tight">
              Tầng {floor}
            </h2>
            <div className="bg-border h-px flex-1" />
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {floorRooms.map((room) => {
              const status = roomStatusConfig[room.status];

              return (
                <EntityListCard
                  key={room.id}
                  className="pt-0"
                  overlay={
                    <Link
                      to={ROUTES.roomDetailPath(room.id)}
                      className="absolute inset-0 z-0"
                    />
                  }
                  header={
                    // Badge only, no colour-filled header (spec #153 §3.3: "Phòng
                    // header KHÔNG tô màu theo trạng thái; badge đủ").
                    <CardHeader className="flex items-start justify-between gap-2 py-4">
                      <div>
                        <h3 className="text-lg leading-none font-bold">
                          {room.name}
                        </h3>
                        <p className="text-muted-foreground mt-1 text-[10px] font-medium tracking-wider uppercase">
                          {roomTypeConfig[room.type].label} • {room.area}m²
                        </p>
                      </div>
                      <StatusBadge config={status} isCompact />
                    </CardHeader>
                  }
                  content={
                    <CardContent className="flex flex-col gap-2">
                      <div className="text-muted-foreground flex items-center gap-1.5 text-xs font-medium">
                        <User className="size-3.5" />
                        <span className="truncate">
                          {room.tenant ?? "Trống"}
                        </span>
                      </div>
                      <span className="text-sm font-bold">
                        {formatCurrency(room.price)}
                      </span>
                    </CardContent>
                  }
                  footer={
                    <CardFooter className="relative z-10 justify-end">
                      <RoomRowActions room={room} side="top" />
                    </CardFooter>
                  }
                />
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
