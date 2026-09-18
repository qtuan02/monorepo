import { DoorOpen } from "lucide-react";

import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@monorepo/ui/components/item";

import type { Room } from "~/types/room";
import { StatusBadge } from "~/components/badge/status-badge";
import { roomStatusConfig, roomTypeConfig } from "~/constants/status";
import { formatCurrency } from "~/utils/currency";
import RoomRowActions from "./room-row-actions";

/** A Phòng table row's mobile substitute — `renderMobileRow` on `DataTable`. */
export default function RoomMobileRow({ room }: { room: Room }) {
  return (
    <Item variant="outline" size="sm">
      <ItemMedia variant="icon">
        <DoorOpen />
      </ItemMedia>
      <ItemContent>
        <ItemTitle>{room.name}</ItemTitle>
        <ItemDescription>
          Tầng {room.floor} · {roomTypeConfig[room.type].label} ·{" "}
          {formatCurrency(room.price)}
        </ItemDescription>
      </ItemContent>
      <ItemActions>
        <StatusBadge config={roomStatusConfig[room.status]} isCompact />
        <RoomRowActions room={room} />
      </ItemActions>
    </Item>
  );
}
