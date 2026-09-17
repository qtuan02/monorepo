import { User } from "lucide-react";

import {
  CardContent,
  CardFooter,
  CardHeader,
} from "@monorepo/ui/components/card";
import { cn } from "@monorepo/ui/utils/cn";

import type { Room } from "~/types/room";
import { EntityListCard } from "~/components/card/entity-list-card";
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

/** The card view of the Phòng list — the same filtered page the table shows, by floor. */
export default function RoomGrid({ rooms }: RoomGridProps) {
  return (
    <div className="space-y-8">
      {groupByFloor(rooms).map(({ floor, rooms: floorRooms }) => (
        <section key={floor} className="space-y-4">
          <div className="flex items-center gap-4">
            <h2 className="text-foreground/80 text-lg font-semibold tracking-tight">
              Tầng {floor}
            </h2>
            <div className="bg-border h-px flex-1" />
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {floorRooms.map((room) => {
              const status = roomStatusConfig[room.status];
              const StatusIcon = status.icon;

              return (
                <EntityListCard
                  key={room.id}
                  className="pt-0"
                  header={
                    <CardHeader className={cn("py-4", status.className)}>
                      <h3 className="text-lg leading-none font-bold">
                        {room.name}
                      </h3>
                      <p className="mt-1 text-[10px] font-medium tracking-wider uppercase opacity-70">
                        {roomTypeConfig[room.type].label} • {room.area}m²
                      </p>
                    </CardHeader>
                  }
                  content={
                    <CardContent className="flex flex-col gap-2">
                      <div className="flex items-center gap-1.5 text-xs font-medium">
                        <User className="size-3.5 opacity-70" />
                        <span className="truncate opacity-90">
                          {room.tenant ?? "Trống"}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center justify-between">
                        <span className="text-sm font-bold opacity-90">
                          {formatCurrency(room.price)}
                        </span>
                        {StatusIcon && (
                          <StatusIcon className="size-4 opacity-70" />
                        )}
                      </div>
                    </CardContent>
                  }
                  footer={
                    <CardFooter className="justify-end">
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
