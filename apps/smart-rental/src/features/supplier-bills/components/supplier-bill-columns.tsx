import { Eye } from "lucide-react";
import { Link } from "react-router";

import { buttonVariants } from "@monorepo/ui/components/button";
import {
  createDataTableColumnHelper,
  DataTableColumnHeader,
} from "@monorepo/ui/components/data-table";

import type { SupplierBill } from "~/types/supplier-bill";
import { StatusBadge } from "~/components/badge/status-badge";
import { facetFilterFn } from "~/components/data-table/data-table";
import { ROUTES } from "~/constants/routes";
import {
  supplierBillPaymentConfig,
  supplierBillTypeConfig,
} from "~/constants/status";
import { getSupplierBillPaymentStatus } from "~/features/supplier-bills/utils/supplier-bill-payment";
import { formatCurrency } from "~/utils/currency";
import { formatDate } from "~/utils/date";

const helper = createDataTableColumnHelper<SupplierBill>();

/**
 * The Hoá đơn nhà cung cấp table. `supplierName` carries the search; `type`,
 * `billingPeriod` and the derived `paymentStatus` carry the facets — the
 * prototype showed paid/pending as a display column, so it could not filter
 * on it.
 */
export const supplierBillColumns = helper.columns([
  helper.accessor("type", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Loại dịch vụ" />
    ),
    cell: ({ getValue }) => supplierBillTypeConfig[getValue()].label,
    filterFn: facetFilterFn,
  }),
  helper.accessor("supplierName", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nhà cung cấp" />
    ),
    cell: ({ getValue }) => <span className="font-medium">{getValue()}</span>,
    filterFn: "includesString",
  }),
  helper.accessor("buildingName", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Toà nhà" />
    ),
  }),
  helper.accessor("billingPeriod", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Kỳ hoá đơn" />
    ),
    cell: ({ getValue }) => <span className="font-mono">{getValue()}</span>,
    filterFn: facetFilterFn,
  }),
  helper.accessor("totalAmount", {
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Số tiền"
        className="ml-auto"
      />
    ),
    cell: ({ getValue }) => (
      <div className="text-right font-semibold tabular-nums">
        {formatCurrency(getValue())}
      </div>
    ),
  }),
  helper.accessor("paymentDate", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Ngày thanh toán" />
    ),
    cell: ({ getValue }) => {
      const value = getValue();
      return value ? (
        formatDate(value)
      ) : (
        <span className="text-muted-foreground italic">—</span>
      );
    },
  }),
  helper.accessor(getSupplierBillPaymentStatus, {
    id: "paymentStatus",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Trạng thái" />
    ),
    cell: ({ getValue }) => (
      <StatusBadge config={supplierBillPaymentConfig[getValue()]} />
    ),
    filterFn: facetFilterFn,
  }),
  helper.display({
    id: "actions",
    cell: ({ row }) => (
      <Link
        to={ROUTES.supplierBillDetailPath(row.original.id)}
        aria-label="Xem chi tiết"
        className={buttonVariants({ variant: "outline", size: "icon-sm" })}
      >
        <Eye />
      </Link>
    ),
  }),
]);
