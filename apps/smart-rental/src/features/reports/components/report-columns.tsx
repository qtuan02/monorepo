import {
  createDataTableColumnHelper,
  DataTableColumnHeader,
} from "@monorepo/ui/components/data-table";

import type { ReportRow } from "~/types/report";
import { StatusBadge } from "~/components/badge/status-badge";
import { facetFilterFn } from "~/components/data-table/data-table";
import { occupancyBucketConfig } from "~/constants/status";
import { formatCurrency } from "~/utils/currency";
import { occupancyBucket } from "~/utils/report-rows";

const helper = createDataTableColumnHelper<ReportRow>();

/**
 * The per-kỳ table for one Toà nhà scope (spec #153 §10 row 29). `month`
 * carries the URL facet — the building/floor/status filters `ReportFiltersBar`
 * used to hand-roll are gone: the scope already narrows the building, and
 * `floor` is always "Tất cả tầng" here (no per-floor cost split, see
 * `buildReportRows`).
 */
export const reportColumns = helper.columns([
  helper.accessor("month", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tháng" />
    ),
    filterFn: facetFilterFn,
  }),
  helper.accessor("revenue", {
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Doanh thu"
        className="ml-auto"
      />
    ),
    cell: ({ getValue }) => (
      <span className="text-foreground block text-right font-semibold tabular-nums">
        {formatCurrency(getValue())}
      </span>
    ),
  }),
  helper.accessor("expenses", {
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Chi phí"
        className="ml-auto"
      />
    ),
    cell: ({ getValue }) => (
      <span className="text-foreground block text-right font-semibold tabular-nums">
        {formatCurrency(getValue())}
      </span>
    ),
  }),
  helper.accessor("profit", {
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Lợi nhuận"
        className="ml-auto"
      />
    ),
    cell: ({ getValue }) => (
      <span className="text-foreground block text-right font-semibold tabular-nums">
        {formatCurrency(getValue())}
      </span>
    ),
  }),
  helper.accessor("occupancyRate", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Lấp đầy" />
    ),
    cell: ({ getValue }) => (
      <StatusBadge
        config={{
          ...occupancyBucketConfig[occupancyBucket(getValue())],
          label: `${getValue()}%`,
        }}
      />
    ),
  }),
]);
