import { Badge } from "@monorepo/ui/components/badge";
import {
  createDataTableColumnHelper,
  DataTableColumnHeader,
} from "@monorepo/ui/components/data-table";

import type { Contract } from "~/types/contract";
import { StatusBadge } from "~/components/badge/status-badge";
import { facetFilterFn } from "~/components/data-table/data-table";
import { contractStatusConfig } from "~/constants/status";
import { formatCurrency } from "~/utils/currency";
import { formatDate } from "~/utils/date";
import ContractRowActions from "./contract-row-actions";

const helper = createDataTableColumnHelper<Contract>();

/**
 * The Hợp đồng table, minus the prototype's drag handle (row reorder is not
 * ported — spec #127). `contractNumber` carries the search, `status` the
 * facet. No selection column: nothing on this screen acts on a selection
 * (spec #221 T2 — `DataTable` only prepends one when given `selectionActions`).
 */
export const contractColumns = helper.columns([
  helper.accessor("contractNumber", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Số HĐ" />
    ),
    cell: ({ getValue }) => (
      <span className="font-mono font-medium">{getValue()}</span>
    ),
    filterFn: "includesString",
  }),
  helper.accessor("tenant", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Người thuê" />
    ),
  }),
  helper.accessor("room", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Phòng" />
    ),
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <span>{row.original.room}</span>
        <Badge variant="outline" className="font-mono">
          T{row.original.floor}
        </Badge>
      </div>
    ),
  }),
  helper.accessor("rentAmount", {
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Tiền thuê"
        className="ml-auto"
      />
    ),
    cell: ({ getValue }) => (
      <div className="text-right font-medium tabular-nums">
        {formatCurrency(getValue())}
      </div>
    ),
  }),
  helper.accessor("startDate", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Bắt đầu" />
    ),
    cell: ({ getValue }) => (
      <span className="text-muted-foreground">{formatDate(getValue())}</span>
    ),
  }),
  helper.accessor("endDate", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Kết thúc" />
    ),
    cell: ({ getValue }) => (
      <span className="text-muted-foreground">{formatDate(getValue())}</span>
    ),
  }),
  helper.accessor("status", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Trạng thái" />
    ),
    cell: ({ getValue }) => (
      <StatusBadge config={contractStatusConfig[getValue()]} />
    ),
    filterFn: facetFilterFn,
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
    cell: ({ row }) => <ContractRowActions contract={row.original} />,
  }),
]);
