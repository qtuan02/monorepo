import { Copy, Eye } from "lucide-react";

import { useCopyToClipboard } from "@monorepo/hook/use-copy-to-clipboard";

import type { Room } from "~/types/room";
import { EntityActionMenu } from "~/components/menu/entity-action-menu";
import { ROUTES } from "~/constants/routes";

interface RoomRowActionsProps {
  room: Room;
  side?: "top" | "bottom";
}

/**
 * The "⋯" of a Phòng row or card. "Chỉnh sửa" and "Xóa phòng" are both real
 * flows already, on the detail screen — one click away via "Xem chi tiết"
 * — so the row menu does not duplicate them.
 */
export default function RoomRowActions({
  room,
  side = "bottom",
}: RoomRowActionsProps) {
  const [, copy] = useCopyToClipboard();

  return (
    <EntityActionMenu
      side={side}
      items={[
        {
          key: "copy",
          label: "Sao chép ID",
          icon: <Copy />,
          onClick: () => void copy(room.id),
        },
        {
          key: "detail",
          label: "Xem chi tiết",
          icon: <Eye />,
          link: ROUTES.roomDetailPath(room.id),
        },
      ]}
    />
  );
}
