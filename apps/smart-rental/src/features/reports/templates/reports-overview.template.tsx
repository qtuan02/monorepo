import { Download, FileBarChart } from "lucide-react";

import { Button } from "@monorepo/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@monorepo/ui/components/card";
import { toast } from "@monorepo/ui/components/toast";

import type { MonthlyPoint } from "~/types/dashboard";
import { KpiStrip, KpiStripSkeleton } from "~/components/card/kpi-strip";
import { RevenueChart } from "~/components/chart/revenue-chart";
import { DataTable } from "~/components/data-table/data-table";
import { ListPageHeader } from "~/components/page/list-page-header";
import { ErrorPanel } from "~/components/panel/error-panel";
import {
  CardGridSkeleton,
  TableSkeleton,
} from "~/components/panel/loading-panel";
import BuildingComparisonTable from "~/features/reports/components/building-comparison-table";
import FloorOccupancyChart from "~/features/reports/components/floor-occupancy-chart";
import { reportColumns } from "~/features/reports/components/report-columns";
import {
  useGetBuildingComparison,
  useGetFloorOccupancy,
  useGetProfitLossSummary,
  useGetReportRows,
} from "~/hooks/api/report";
import { useBuildingStore } from "~/stores/use-building-store";
import { downloadCsv } from "~/utils/csv";
import { formatCurrency } from "~/utils/currency";
import {
  buildBuildingComparisonCsv,
  buildReportRowsCsv,
} from "~/utils/report-rows";

/** "Xuất báo cáo" on `ListPageHeader`'s own row (round 4 §10 Q16) — reads off
 * the same query the table below renders, deduped through the cache. */
function ExportReportRowsButton({ buildingId }: { buildingId: string }) {
  const rowsQuery = useGetReportRows({ buildingId });

  function exportCsv() {
    const rows = rowsQuery.data ?? [];
    if (rows.length === 0) {
      toast.add({ title: "Không có dòng nào để xuất" });
      return;
    }
    downloadCsv("bao-cao.csv", buildReportRowsCsv(rows));
  }

  return (
    <Button type="button" variant="outline" size="sm" onClick={exportCsv}>
      <Download />
      Xuất báo cáo
    </Button>
  );
}

/** Same idea for the scope-`null` comparison table. */
function ExportBuildingComparisonButton() {
  const comparisonQuery = useGetBuildingComparison();

  function exportCsv() {
    const rows = comparisonQuery.data ?? [];
    if (rows.length === 0) {
      toast.add({ title: "Không có dòng nào để xuất" });
      return;
    }
    downloadCsv("bao-cao-so-sanh.csv", buildBuildingComparisonCsv(rows));
  }

  return (
    <Button type="button" variant="outline" size="sm" onClick={exportCsv}>
      <Download />
      Xuất báo cáo
    </Button>
  );
}

/**
 * One Toà nhà: doanh thu 6 kỳ + lấp đầy theo tầng on chart, kỳ on a
 * `DataTable` — whose own toolbar is where "Kỳ" already lives as a facet
 * (round 4 §10 Q16: no separate row for it).
 */
function SingleBuildingReport({ buildingId }: { buildingId: string }) {
  const summaryQuery = useGetProfitLossSummary({ buildingId });
  const rowsQuery = useGetReportRows({ buildingId });
  const floorQuery = useGetFloorOccupancy({ buildingId });
  const rows = rowsQuery.data ?? [];

  return (
    <>
      {summaryQuery.isLoading ? (
        <KpiStripSkeleton />
      ) : summaryQuery.isError || !summaryQuery.data ? (
        <ErrorPanel
          description="Không thể tải tóm tắt lãi lỗ."
          action={{
            label: "Thử lại",
            onClick: () => void summaryQuery.refetch(),
          }}
        />
      ) : (
        <KpiStrip
          items={[
            {
              label: "Tổng doanh thu",
              value: formatCurrency(summaryQuery.data.totalRevenue),
            },
            {
              label: "Chi phí",
              value: formatCurrency(summaryQuery.data.totalExpenses),
            },
            {
              label: "Lợi nhuận",
              value: formatCurrency(summaryQuery.data.totalProfit),
            },
            {
              label: "Lấp đầy phòng",
              value: `${summaryQuery.data.avgOccupancy}%`,
            },
          ]}
        />
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Doanh thu theo tháng</CardTitle>
          </CardHeader>
          <CardContent>
            {rowsQuery.isLoading ? (
              <CardGridSkeleton itemCount={1} className="lg:grid-cols-1" />
            ) : rowsQuery.isError || !rowsQuery.data ? (
              <ErrorPanel
                description="Không thể tải doanh thu."
                action={{
                  label: "Thử lại",
                  onClick: () => void rowsQuery.refetch(),
                }}
              />
            ) : (
              <RevenueChart
                data={rowsQuery.data.map(
                  (row): MonthlyPoint => ({
                    month: row.month,
                    value: Math.round(row.revenue / 1_000_000),
                  }),
                )}
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Lấp đầy theo tầng</CardTitle>
          </CardHeader>
          <CardContent>
            {floorQuery.isLoading ? (
              <CardGridSkeleton itemCount={1} className="lg:grid-cols-1" />
            ) : floorQuery.isError || !floorQuery.data ? (
              <ErrorPanel
                description="Không thể tải lấp đầy theo tầng."
                action={{
                  label: "Thử lại",
                  onClick: () => void floorQuery.refetch(),
                }}
              />
            ) : (
              <FloorOccupancyChart data={floorQuery.data} />
            )}
          </CardContent>
        </Card>
      </div>

      <DataTable
        columns={reportColumns}
        query={rowsQuery}
        getRowId={(row) => row.month}
        paginate={false}
        facets={[
          {
            columnId: "month",
            title: "Kỳ",
            options: rows.map((row) => ({
              value: row.month,
              label: row.month,
            })),
          },
        ]}
        empty={{ icon: FileBarChart, title: "Không có dòng báo cáo" }}
      />
    </>
  );
}

/** Scope `null`: một bảng so sánh giữa các Toà nhà (spec #153 §10 row 29). */
function BuildingComparisonReport() {
  const comparisonQuery = useGetBuildingComparison();

  return comparisonQuery.isLoading ? (
    <TableSkeleton />
  ) : comparisonQuery.isError || !comparisonQuery.data ? (
    <ErrorPanel
      description="Không thể tải bảng so sánh."
      action={{
        label: "Thử lại",
        onClick: () => void comparisonQuery.refetch(),
      }}
    />
  ) : (
    <BuildingComparisonTable rows={comparisonQuery.data} />
  );
}

/**
 * "Báo cáo" theo Building scope của shell (spec #153 §10 row 29): một Toà
 * nhà → doanh thu 6 kỳ + lấp đầy theo tầng trên chart, cùng kỳ trên
 * `DataTable`; `null` → bảng so sánh giữa các Toà nhà. Bốn tab cũ và
 * `ReportFiltersBar` đều gỡ — không còn "Lợi nhuận dịch vụ" (một con số cứng
 * mỗi tầng) hay "Cảnh báo thất thoát" (luôn rỗng), và không còn key trùng
 * (research C.1 #19 — chúng đến từ Mock cũ, đã bỏ ở ADR-0012). Round 4 §10
 * Q16 drops "Tỷ lệ lấp đầy" (a donut with no label the KPI strip already
 * prints) and moves "Xuất báo cáo" onto this header's own row.
 */
export default function ReportsOverviewTemplate() {
  const selectedBuildingId = useBuildingStore((s) => s.selectedBuildingId);

  return (
    <div className="space-y-6">
      <ListPageHeader
        title="Báo cáo"
        description="Phân tích doanh thu, chi phí và hiệu suất quản lý."
        actions={
          selectedBuildingId ? (
            <ExportReportRowsButton buildingId={selectedBuildingId} />
          ) : (
            <ExportBuildingComparisonButton />
          )
        }
      />

      {selectedBuildingId ? (
        <SingleBuildingReport buildingId={selectedBuildingId} />
      ) : (
        <BuildingComparisonReport />
      )}
    </div>
  );
}
