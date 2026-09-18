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
import {
  CardGridSkeleton,
  TableSkeleton,
} from "~/components/panel/loading-panel";
import { QuerySection } from "~/components/panel/query-section";
import BuildingComparisonTable from "~/features/reports/components/building-comparison-table";
import FloorOccupancyChart from "~/features/reports/components/floor-occupancy-chart";
import OccupancyDonutChart from "~/features/reports/components/occupancy-donut-chart";
import { reportColumns } from "~/features/reports/components/report-columns";
import {
  useGetBuildingComparison,
  useGetFloorOccupancy,
  useGetProfitLossSummary,
  useGetReportRows,
} from "~/hooks/api/report";
import { useGetRooms } from "~/hooks/api/room";
import { useBuildingStore } from "~/stores/use-building-store";
import { downloadCsv } from "~/utils/csv";
import { formatCurrency } from "~/utils/currency";
import {
  buildBuildingComparisonCsv,
  buildReportRowsCsv,
} from "~/utils/report-rows";

/** One Toà nhà: doanh thu 6 kỳ + lấp đầy theo tầng on chart, kỳ on a `DataTable`. */
function SingleBuildingReport({ buildingId }: { buildingId: string }) {
  const summaryQuery = useGetProfitLossSummary({ buildingId });
  const rowsQuery = useGetReportRows({ buildingId });
  const floorQuery = useGetFloorOccupancy({ buildingId });
  const roomsQuery = useGetRooms({ buildingId });
  const rows = rowsQuery.data ?? [];

  function exportCsv() {
    if (rows.length === 0) {
      toast.add({ title: "Không có dòng nào để xuất" });
      return;
    }
    downloadCsv("bao-cao.csv", buildReportRowsCsv(rows));
  }

  return (
    <>
      <div className="flex items-center justify-end">
        <Button type="button" variant="outline" size="sm" onClick={exportCsv}>
          <Download />
          Xuất báo cáo
        </Button>
      </div>

      <QuerySection
        query={summaryQuery}
        errorText="Không thể tải tóm tắt lãi lỗ."
        loading={<KpiStripSkeleton />}
      >
        {(summary) => (
          <KpiStrip
            items={[
              {
                label: "Tổng doanh thu",
                value: formatCurrency(summary.totalRevenue),
              },
              {
                label: "Chi phí",
                value: formatCurrency(summary.totalExpenses),
              },
              {
                label: "Lợi nhuận",
                value: formatCurrency(summary.totalProfit),
              },
              { label: "Lấp đầy phòng", value: `${summary.avgOccupancy}%` },
            ]}
          />
        )}
      </QuerySection>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Tỷ lệ lấp đầy</CardTitle>
          </CardHeader>
          <CardContent>
            <QuerySection
              query={roomsQuery}
              errorText="Không thể tải danh sách Phòng."
              loading={
                <CardGridSkeleton itemCount={1} className="lg:grid-cols-1" />
              }
            >
              {(rooms) => (
                <OccupancyDonutChart
                  occupied={
                    rooms.filter((room) => room.status === "occupied").length
                  }
                  vacant={
                    rooms.filter((room) => room.status === "available").length
                  }
                  vacantRoomNames={rooms
                    .filter((room) => room.status === "available")
                    .map((room) => room.name)}
                />
              )}
            </QuerySection>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Doanh thu theo tháng</CardTitle>
          </CardHeader>
          <CardContent>
            <QuerySection
              query={rowsQuery}
              errorText="Không thể tải doanh thu."
              loading={
                <CardGridSkeleton itemCount={1} className="lg:grid-cols-1" />
              }
            >
              {(reportRows) => {
                const revenueByMonth: MonthlyPoint[] = reportRows.map(
                  (row) => ({
                    month: row.month,
                    value: Math.round(row.revenue / 1_000_000),
                  }),
                );
                return <RevenueChart data={revenueByMonth} />;
              }}
            </QuerySection>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Lấp đầy theo tầng</CardTitle>
          </CardHeader>
          <CardContent>
            <QuerySection
              query={floorQuery}
              errorText="Không thể tải lấp đầy theo tầng."
              loading={
                <CardGridSkeleton itemCount={1} className="lg:grid-cols-1" />
              }
            >
              {(floors) => <FloorOccupancyChart data={floors} />}
            </QuerySection>
          </CardContent>
        </Card>
      </div>

      <QuerySection
        query={rowsQuery}
        errorText="Không thể tải dữ liệu báo cáo."
        loading={<TableSkeleton />}
      >
        {(reportRows) => (
          <DataTable
            columns={reportColumns}
            data={reportRows}
            getRowId={(row) => row.month}
            paginate={false}
            facets={[
              {
                columnId: "month",
                title: "Kỳ",
                options: reportRows.map((row) => ({
                  value: row.month,
                  label: row.month,
                })),
              },
            ]}
            empty={{
              icon: FileBarChart,
              title: "Không có dòng báo cáo",
              description: "Toà nhà này chưa có Hoá đơn nào.",
            }}
          />
        )}
      </QuerySection>
    </>
  );
}

/** Scope `null`: một bảng so sánh giữa các Toà nhà (spec #153 §10 row 29). */
function BuildingComparisonReport() {
  const comparisonQuery = useGetBuildingComparison();
  const rows = comparisonQuery.data ?? [];

  function exportCsv() {
    if (rows.length === 0) {
      toast.add({ title: "Không có dòng nào để xuất" });
      return;
    }
    downloadCsv("bao-cao-so-sanh.csv", buildBuildingComparisonCsv(rows));
  }

  return (
    <>
      <div className="flex items-center justify-end">
        <Button type="button" variant="outline" size="sm" onClick={exportCsv}>
          <Download />
          Xuất báo cáo
        </Button>
      </div>

      <QuerySection
        query={comparisonQuery}
        errorText="Không thể tải bảng so sánh."
        loading={<TableSkeleton />}
      >
        {(comparisonRows) => <BuildingComparisonTable rows={comparisonRows} />}
      </QuerySection>
    </>
  );
}

/**
 * "Báo cáo" theo Building scope của shell (spec #153 §10 row 29): một Toà
 * nhà → doanh thu 6 kỳ + lấp đầy theo tầng trên chart, cùng kỳ trên
 * `DataTable`; `null` → bảng so sánh giữa các Toà nhà. Bốn tab cũ và
 * `ReportFiltersBar` đều gỡ — không còn "Lợi nhuận dịch vụ" (một con số cứng
 * mỗi tầng) hay "Cảnh báo thất thoát" (luôn rỗng), và không còn key trùng
 * (research C.1 #19 — chúng đến từ Mock cũ, đã bỏ ở ADR-0012).
 */
export default function ReportsOverviewTemplate() {
  const selectedBuildingId = useBuildingStore((s) => s.selectedBuildingId);

  return (
    <div className="space-y-6">
      <ListPageHeader
        title="Báo cáo"
        description="Phân tích doanh thu, chi phí và hiệu suất quản lý."
      />

      {selectedBuildingId ? (
        <SingleBuildingReport buildingId={selectedBuildingId} />
      ) : (
        <BuildingComparisonReport />
      )}
    </div>
  );
}
