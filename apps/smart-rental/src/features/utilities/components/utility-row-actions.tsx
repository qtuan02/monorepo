import { Eye } from "lucide-react";

import type { Utility } from "~/types/utility";
import { EntityActionMenu } from "~/components/menu/entity-action-menu";
import { ROUTES } from "~/constants/routes";

interface UtilityRowActionsProps {
  utility: Utility;
  side?: "top" | "bottom";
}

/** The "⋯" of a Chỉ số điện nước row. */
export default function UtilityRowActions({
  utility,
  side = "bottom",
}: UtilityRowActionsProps) {
  return (
    <EntityActionMenu
      side={side}
      items={[
        {
          key: "detail",
          label: "Xem chi tiết",
          icon: <Eye />,
          link: ROUTES.utilityDetailPath(utility.id),
        },
      ]}
    />
  );
}
