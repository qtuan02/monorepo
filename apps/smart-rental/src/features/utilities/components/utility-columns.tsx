import {
  createDataTableColumnHelper,
  DataTableColumnHeader,
} from "@monorepo/ui/components/data-table";

import type { Utility } from "~/types/utility";
import { StatusBadge } from "~/components/badge/status-badge";
import { facetFilterFn } from "~/components/data-table/data-table";
import { utilityStatusConfig, utilityTypeConfig } from "~/constants/status";
import { utilityUnit } from "~/features/utilities/utils/meter-reading";
import { formatDateTime, formatMonth } from "~/utils/date";
import UtilityRowActions from "./utility-row-actions";

const helper = createDataTableColumnHelper<Utility>();

/**
 * The Chỉ số điện nước table. `roomName` carries the search, `status` and
 * `type` the facets — the prototype also searched `month`, but the composite
 * searches one column.
 */
export const utilityColumns = helper.columns([
  helper.accessor("roomName", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Phòng" />
    ),
    cell: ({ getValue }) => <span className="font-bold">{getValue()}</span>,
    filterFn: "includesString",
  }),
  helper.accessor("month", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Kỳ hoá đơn" />
    ),
    cell: ({ getValue }) => (
      <span className="font-medium">{formatMonth(getValue())}</span>
    ),
    filterFn: facetFilterFn,
  }),
  helper.accessor("type", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Loại hình" />
    ),
    cell: ({ getValue }) => (
      <StatusBadge config={utilityTypeConfig[getValue()]} />
    ),
    filterFn: facetFilterFn,
  }),
  helper.display({
    id: "indices",
    header: "Chỉ số (Cũ / Mới)",
    cell: ({ row }) => (
      <span className="flex items-center gap-2 font-mono text-sm tabular-nums">
        <span className="text-muted-foreground">{row.original.oldIndex}</span>
        <span className="text-muted-foreground/30">/</span>
        <span className="font-bold">{row.original.newIndex}</span>
      </span>
    ),
  }),
  helper.accessor("consumption", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tiêu thụ" />
    ),
    cell: ({ row }) => (
      <span className="flex items-center gap-1.5">
        <span className="text-primary font-bold tabular-nums">
          {row.original.consumption.toLocaleString("vi-VN")}
        </span>
        <span className="text-muted-foreground text-xs uppercase">
          {utilityUnit[row.original.type]}
        </span>
      </span>
    ),
  }),
  helper.accessor("status", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Trạng thái" />
    ),
    cell: ({ getValue }) => (
      <StatusBadge config={utilityStatusConfig[getValue()]} />
    ),
    filterFn: facetFilterFn,
  }),
  helper.accessor("updatedAt", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Ngày chốt" />
    ),
    cell: ({ getValue }) => (
      <span className="text-muted-foreground text-xs">
        {formatDateTime(getValue())}
      </span>
    ),
  }),
  helper.display({
    id: "actions",
    cell: ({ row }) => <UtilityRowActions utility={row.original} />,
  }),
]);
