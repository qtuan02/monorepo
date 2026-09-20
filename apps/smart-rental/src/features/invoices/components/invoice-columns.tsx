import {
  createDataTableColumnHelper,
  DataTableColumnHeader,
} from "@monorepo/ui/components/data-table";

import type { Invoice } from "~/types/invoice";
import { StatusBadge } from "~/components/badge/status-badge";
import { facetFilterFn } from "~/components/data-table/data-table";
import { formatCurrency } from "~/utils/currency";
import { formatDate } from "~/utils/date";
import { invoiceStatusBadgeConfig } from "~/utils/invoice-status";
import InvoiceRowActions from "./invoice-row-actions";

const helper = createDataTableColumnHelper<Invoice>();

/**
 * The Hoá đơn table. `invoiceNumber` carries the search, `status` the facet —
 * the prototype also searched `tenant`, but the composite searches one
 * column. No selection column here either: `DataTable` prepends its own
 * because `invoice-list.template.tsx` passes `selectionActions` (Gửi nhắc).
 */
export const invoiceColumns = helper.columns([
  helper.accessor("invoiceNumber", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Số hoá đơn" />
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
    cell: ({ row }) => (
      <span className="font-medium">
        {row.original.tenant} · {row.original.room}
      </span>
    ),
  }),
  helper.accessor("amount", {
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Tổng tiền"
        className="ml-auto"
      />
    ),
    cell: ({ getValue }) => (
      <div className="text-foreground text-right font-semibold tabular-nums">
        {formatCurrency(getValue())}
      </div>
    ),
  }),
  helper.accessor("dueDate", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Hạn thanh toán" />
    ),
    cell: ({ getValue }) => (
      <span className="text-muted-foreground text-sm">
        {formatDate(getValue())}
      </span>
    ),
  }),
  helper.accessor("status", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Trạng thái" />
    ),
    cell: ({ row }) => (
      <StatusBadge config={invoiceStatusBadgeConfig(row.original)} />
    ),
    filterFn: facetFilterFn,
  }),
  helper.display({
    id: "actions",
    cell: ({ row }) => <InvoiceRowActions invoice={row.original} />,
  }),
]);
