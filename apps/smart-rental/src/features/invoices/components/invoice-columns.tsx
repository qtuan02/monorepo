import { Calendar, Home, ReceiptText, User } from "lucide-react";

import {
  createDataTableColumnHelper,
  DataTableColumnHeader,
} from "@monorepo/ui/components/data-table";

import type { Invoice } from "~/types/invoice";
import { StatusBadge } from "~/components/badge/status-badge";
import {
  createSelectionColumn,
  facetFilterFn,
} from "~/components/data-table/data-table";
import { invoiceStatusConfig } from "~/constants/status";
import { formatCurrency } from "~/utils/currency";
import InvoiceRowActions from "./invoice-row-actions";

const helper = createDataTableColumnHelper<Invoice>();

/**
 * The Hoá đơn table. `invoiceNumber` carries the search, `status` the facet —
 * the prototype also searched `tenant`, but the composite searches one column.
 */
export const invoiceColumns = helper.columns([
  createSelectionColumn<Invoice>(),
  helper.accessor("invoiceNumber", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Số hoá đơn" />
    ),
    cell: ({ getValue }) => (
      <div className="flex items-center gap-3">
        <div className="bg-primary/10 text-primary flex size-8 items-center justify-center rounded-lg">
          <ReceiptText className="size-4" />
        </div>
        <span className="font-mono font-medium">{getValue()}</span>
      </div>
    ),
    filterFn: "includesString",
  }),
  helper.accessor("tenant", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Người thuê" />
    ),
    cell: ({ row }) => (
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <User className="text-muted-foreground size-3.5" />
          <span className="font-medium">{row.original.tenant}</span>
        </div>
        <div className="text-muted-foreground flex items-center gap-2 text-xs">
          <Home className="size-3" />
          <span>{row.original.room}</span>
        </div>
      </div>
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
      <div className="text-primary text-right font-bold tabular-nums">
        {formatCurrency(getValue())}
      </div>
    ),
  }),
  helper.accessor("dueDate", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Hạn thanh toán" />
    ),
    cell: ({ getValue }) => (
      <div className="text-muted-foreground flex items-center gap-2 text-sm">
        <Calendar className="size-4" />
        <span>{getValue()}</span>
      </div>
    ),
  }),
  helper.accessor("status", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Trạng thái" />
    ),
    cell: ({ getValue }) => (
      <StatusBadge config={invoiceStatusConfig[getValue()]} />
    ),
    filterFn: facetFilterFn,
  }),
  helper.display({
    id: "actions",
    cell: ({ row }) => <InvoiceRowActions invoice={row.original} />,
  }),
]);
