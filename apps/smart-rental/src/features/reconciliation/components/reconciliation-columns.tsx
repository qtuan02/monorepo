import {
  createDataTableColumnHelper,
  DataTableColumnHeader,
} from "@monorepo/ui/components/data-table";

import type { ReconciliationItem } from "~/types/reconciliation";
import { StatusBadge } from "~/components/badge/status-badge";
import { facetFilterFn } from "~/components/data-table/data-table";
import { reconciliationStatusConfig } from "~/constants/status";
import { formatCurrency } from "~/utils/currency";

const helper = createDataTableColumnHelper<ReconciliationItem>();

/**
 * The Đối soát table: one line per service, income beside expense, the
 * difference on the right with its trend. `lineItemName` carries the search,
 * `status` the facet.
 */
export const reconciliationColumns = helper.columns([
  helper.accessor("lineItemName", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Hạng mục" />
    ),
    cell: ({ getValue }) => <span className="font-semibold">{getValue()}</span>,
    filterFn: "includesString",
  }),
  helper.accessor("status", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Trạng thái" />
    ),
    cell: ({ getValue }) => (
      <StatusBadge config={reconciliationStatusConfig[getValue()]} />
    ),
    filterFn: facetFilterFn,
  }),
  helper.accessor("incomeAmount", {
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Thu từ Người thuê"
        className="ml-auto"
      />
    ),
    cell: ({ getValue }) => (
      <div className="text-foreground text-right font-semibold tabular-nums">
        {formatCurrency(getValue())}
      </div>
    ),
  }),
  helper.accessor("expenseAmount", {
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Chi cho NCC"
        className="ml-auto"
      />
    ),
    cell: ({ getValue }) => (
      <div className="text-foreground text-right font-semibold tabular-nums">
        {formatCurrency(getValue())}
      </div>
    ),
  }),
  helper.accessor("netAmount", {
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Chênh lệch"
        className="ml-auto"
      />
    ),
    cell: ({ row, getValue }) => {
      const trendRate = row.original.trendRate;
      return (
        <div className="flex flex-col items-end">
          <div className="text-foreground font-semibold tabular-nums">
            {formatCurrency(Math.abs(getValue()))}
          </div>
          {/* 0 is no trend, not a "0%" line — the prototype hid it the same
              way. The status badge already carries Lỗ/Lãi, so this stays
              plain rather than colouring the same state a third time. */}
          {!!trendRate && (
            <div className="text-muted-foreground text-xs">
              {trendRate > 0 ? "+" : ""}
              {trendRate}% so với kỳ trước
            </div>
          )}
        </div>
      );
    },
  }),
]);
