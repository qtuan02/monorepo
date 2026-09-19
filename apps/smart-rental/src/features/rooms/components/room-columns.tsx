import { Badge } from "@monorepo/ui/components/badge";
import {
  createDataTableColumnHelper,
  DataTableColumnHeader,
} from "@monorepo/ui/components/data-table";

import type { RoomView } from "~/types/room";
import { StatusBadge } from "~/components/badge/status-badge";
import { facetFilterFn } from "~/components/data-table/data-table";
import { roomStatusConfig, roomTypeConfig } from "~/constants/status";
import { formatCurrency } from "~/utils/currency";
import { formatDate } from "~/utils/date";
import RoomRowActions from "./room-row-actions";

const helper = createDataTableColumnHelper<RoomView>();

/**
 * The Phòng table, minus the prototype's drag handle (row reorder is not
 * ported — spec #127). `name` carries the search, `type` and `status` the
 * facets, so their `filterFn`s are the two the composite understands. No
 * selection column: nothing on this screen acts on a selection (spec #221 T2
 * — `DataTable` only prepends one when given `selectionActions`).
 */
export const roomColumns = helper.columns([
  helper.accessor("name", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tên phòng" />
    ),
    cell: ({ getValue }) => <span className="font-medium">{getValue()}</span>,
    filterFn: "includesString",
  }),
  helper.accessor("floor", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tầng" />
    ),
    cell: ({ getValue }) => (
      <Badge variant="outline" className="font-mono">
        T{getValue()}
      </Badge>
    ),
  }),
  helper.accessor("type", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Loại phòng" />
    ),
    cell: ({ getValue }) => roomTypeConfig[getValue()].label,
    filterFn: facetFilterFn,
  }),
  helper.accessor("area", {
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Diện tích"
        className="ml-auto"
      />
    ),
    cell: ({ getValue }) => (
      <div className="text-right font-mono tabular-nums">{getValue()}m²</div>
    ),
  }),
  helper.accessor("price", {
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Giá thuê"
        className="ml-auto"
      />
    ),
    cell: ({ getValue }) => (
      <div className="text-right font-medium tabular-nums">
        {formatCurrency(getValue())}
      </div>
    ),
  }),
  helper.accessor("status", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Trạng thái" />
    ),
    cell: ({ getValue }) => (
      <StatusBadge config={roomStatusConfig[getValue()]} />
    ),
    filterFn: facetFilterFn,
  }),
  helper.accessor("tenant", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Người thuê" />
    ),
    cell: ({ getValue }) =>
      getValue() ?? <span className="text-muted-foreground italic">—</span>,
  }),
  helper.accessor("lastUpdated", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Cập nhật" />
    ),
    cell: ({ getValue }) => (
      <span className="text-muted-foreground">{formatDate(getValue())}</span>
    ),
  }),
  helper.display({
    id: "actions",
    cell: ({ row }) => <RoomRowActions room={row.original} />,
  }),
]);
