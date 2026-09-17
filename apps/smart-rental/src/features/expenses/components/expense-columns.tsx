import { Eye } from "lucide-react";
import { Link } from "react-router";

import { buttonVariants } from "@monorepo/ui/components/button";
import {
  createDataTableColumnHelper,
  DataTableColumnHeader,
} from "@monorepo/ui/components/data-table";

import type { Expense } from "~/types/expense";
import { facetFilterFn } from "~/components/data-table/data-table";
import { ROUTES } from "~/constants/routes";
import { formatCurrency } from "~/utils/currency";
import { formatDate } from "~/utils/date";

const helper = createDataTableColumnHelper<Expense>();

/**
 * The Chi phí table. `description` carries the search and `category` the
 * facet — the prototype searched both, but the composite searches one column
 * and the category is better served as a facet.
 */
export const expenseColumns = helper.columns([
  helper.accessor("category", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Danh mục" />
    ),
    cell: ({ getValue }) => <span className="font-medium">{getValue()}</span>,
    filterFn: facetFilterFn,
  }),
  helper.accessor("buildingName", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tòa nhà" />
    ),
  }),
  helper.accessor("expenseDate", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Ngày chi" />
    ),
    cell: ({ getValue }) => formatDate(getValue()),
  }),
  helper.accessor("amount", {
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
  helper.accessor("description", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Mô tả" />
    ),
    cell: ({ getValue }) =>
      getValue() ?? <span className="text-muted-foreground italic">—</span>,
    filterFn: "includesString",
  }),
  helper.display({
    id: "actions",
    cell: ({ row }) => (
      <Link
        to={ROUTES.expenseDetailPath(row.original.id)}
        aria-label="Xem chi tiết"
        className={buttonVariants({ variant: "outline", size: "icon-sm" })}
      >
        <Eye />
      </Link>
    ),
  }),
]);
