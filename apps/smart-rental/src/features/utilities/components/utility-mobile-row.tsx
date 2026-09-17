import { Link } from "react-router";

import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@monorepo/ui/components/item";

import type { Utility } from "~/types/utility";
import { StatusBadge } from "~/components/badge/status-badge";
import { ROUTES } from "~/constants/routes";
import { utilityStatusConfig, utilityTypeConfig } from "~/constants/status";
import { utilityUnit } from "~/features/utilities/utils/meter-reading";
import { formatMonth } from "~/utils/date";

/** A Chỉ số điện nước row's mobile substitute — `renderMobileRow` on `DataTable`. */
export default function UtilityMobileRow({ utility }: { utility: Utility }) {
  const type = utilityTypeConfig[utility.type];
  const TypeIcon = type.icon;

  return (
    <Item
      variant="outline"
      size="sm"
      render={<Link to={ROUTES.utilityDetailPath(utility.id)} />}
    >
      <ItemMedia variant="icon">{TypeIcon && <TypeIcon />}</ItemMedia>
      <ItemContent>
        <ItemTitle>{utility.roomName}</ItemTitle>
        <ItemDescription>
          {formatMonth(utility.month)} ·{" "}
          {utility.consumption.toLocaleString("vi-VN")}{" "}
          {utilityUnit[utility.type]}
        </ItemDescription>
      </ItemContent>
      <ItemActions>
        <StatusBadge config={utilityStatusConfig[utility.status]} isCompact />
      </ItemActions>
    </Item>
  );
}
