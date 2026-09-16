import { Copy, Edit, Eye, Trash2 } from "lucide-react";

import type { Room } from "~/types/room";
import { EntityActionMenu } from "~/components/menu/entity-action-menu";
import { ROUTES } from "~/constants/routes";

interface RoomRowActionsProps {
  room: Room;
  side?: "top" | "bottom";
}

/**
 * The "⋯" of a Phòng row or card. "Chỉnh sửa" and "Xóa phòng" have no handler
 * here, as in the prototype — they render disabled until the flows exist.
 */
export default function RoomRowActions({
  room,
  side = "bottom",
}: RoomRowActionsProps) {
  return (
    <EntityActionMenu
      side={side}
      items={[
        {
          key: "copy",
          label: "Sao chép ID",
          icon: <Copy />,
          onClick: () => navigator.clipboard.writeText(room.id),
        },
        {
          key: "detail",
          label: "Xem chi tiết",
          icon: <Eye />,
          link: ROUTES.roomDetailPath(room.id),
        },
        { key: "edit", label: "Chỉnh sửa", icon: <Edit /> },
        {
          key: "delete",
          label: "Xóa phòng",
          icon: <Trash2 />,
          isDestructive: true,
        },
      ]}
    />
  );
}
