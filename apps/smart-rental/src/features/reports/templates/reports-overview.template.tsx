import { useState } from "react";
import { AlertCircle, Download, Droplets, Zap } from "lucide-react";

import { Button } from "@monorepo/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@monorepo/ui/components/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@monorepo/ui/components/tabs";
import { toast } from "@monorepo/ui/components/toast";

import { KpiStrip, KpiStripSkeleton } from "~/components/card/kpi-strip";
import { ListPageHeader } from "~/components/page/list-page-header";
import { EmptyPanel } from "~/components/panel/empty-panel";
import {
  CardGridSkeleton,
  TableSkeleton,
} from "~/components/panel/loading-panel";
import { QuerySection } from "~/components/panel/query-section";
import OccupancyBar from "~/components/progress/occupancy-bar";
import ReportFiltersBar from "~/features/reports/components/report-filters-bar";
import ReportTable from "~/features/reports/components/report-table";
import {
  defaultReportFilters,
  filterReportRows,
} from "~/features/reports/utils/report-filters";
import {
  useGetOverdueDebts,
  useGetProfitLossSummary,
  useGetReportRows,
} from "~/hooks/api/report";
import { useUrlTab } from "~/hooks/use-url-tab";
import { useBuildingStore } from "~/stores/use-building-store";
import { formatCurrency } from "~/utils/currency";
import { buildReportRowsCsv } from "~/utils/report-rows";

const TABS = ["pnl", "utilities", "overdue", "performance"] as const;

/** The prototype's fixed figure — one "Lãi dịch vụ" per floor, no calculation behind it. */
const SERVICE_PROFIT = 850000;

const ROWS_ERROR = "Không thể tải dữ liệu báo cáo.";

function rowKey(row: { month: string; building: string; floor: string }) {
  return `${row.month}-${row.building}-${row.floor}`;
}

/**
 * "Báo cáo": KPI cards over the P&L summary, then four tabs — the tab rides
 * on the URL, the three filters stay in state as in the prototype. Three
 * queries, each section gated on its own, so the KPI cards paint while the
 * rows are still loading. "Xuất báo cáo" downloads the on-screen (filtered)
 * rows as CSV (spec #153 §10 row 13) — a toast instead when there is nothing
 * to export.
 */
export default function ReportsOverviewTemplate() {
  const [tab, setTab] = useUrlTab(TABS);
  const [filters, setFilters] = useState(defaultReportFilters);
  const selectedBuildingId = useBuildingStore((s) => s.selectedBuildingId);

  const rowsQuery = useGetReportRows({ buildingId: selectedBuildingId });
  const summaryQuery = useGetProfitLossSummary({
    buildingId: selectedBuildingId,
  });
  const overdueQuery = useGetOverdueDebts({ buildingId: selectedBuildingId });

  const allRows = rowsQuery.data ?? [];
  const rows = filterReportRows(allRows, filters);

  // CSV of the rows currently on screen — the filters above narrow it too.
  function exportRowsCsv() {
    if (rows.length === 0) {
      toast.add({
        title: "Không có dòng nào để xuất",
        description: "Thử đổi bộ lọc toà, tầng hoặc trạng thái.",
      });
      return;
    }
    // A leading BOM so Excel reads the Vietnamese diacritics as UTF-8.
    const blob = new Blob([`﻿${buildReportRowsCsv(rows)}`], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "bao-cao.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <ListPageHeader
        title="Báo cáo"
        description="Phân tích doanh thu, chi phí và hiệu suất quản lý."
        actions={
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={exportRowsCsv}
          >
            <Download />
            Xuất báo cáo
          </Button>
        }
      />

      <ReportFiltersBar
        buildings={[...new Set(allRows.map((row) => row.building))]}
        floors={[...new Set(allRows.map((row) => row.floor))]}
        filters={filters}
        onChange={setFilters}
      />

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

      <Tabs value={tab} onValueChange={setTab} className="space-y-6">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="pnl">Tổng hợp P&L</TabsTrigger>
          <TabsTrigger value="utilities">Lợi nhuận dịch vụ</TabsTrigger>
          <TabsTrigger value="overdue">Công nợ quá hạn</TabsTrigger>
          <TabsTrigger value="performance">Hiệu suất phòng</TabsTrigger>
        </TabsList>

        <TabsContent value="pnl">
          <QuerySection
            query={rowsQuery}
            errorText={ROWS_ERROR}
            loading={<TableSkeleton />}
          >
            {() =>
              rows.length > 0 ? (
                <ReportTable rows={rows} />
              ) : (
                <EmptyPanel
                  title="Không có dòng báo cáo"
                  description="Thử đổi bộ lọc toà, tầng hoặc trạng thái."
                  action={{
                    label: "Đặt lại bộ lọc",
                    onClick: () => setFilters(defaultReportFilters),
                  }}
                  className="border"
                />
              )
            }
          </QuerySection>
        </TabsContent>

        <TabsContent value="utilities">
          <QuerySection
            query={rowsQuery}
            errorText={ROWS_ERROR}
            loading={
              <CardGridSkeleton itemCount={2} className="lg:grid-cols-2" />
            }
          >
            {() => (
              <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">
                      So sánh tiêu thụ & Lợi nhuận
                    </CardTitle>
                    <CardDescription>
                      Thu từ Người thuê vs Chi cho nhà cung cấp
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {rows.map((row) => (
                      <div
                        key={rowKey(row)}
                        className="flex items-center justify-between border-b pb-2 last:border-0"
                      >
                        <div>
                          <p className="font-medium">{row.floor}</p>
                          <p className="text-muted-foreground flex items-center gap-1 text-xs tabular-nums">
                            <Zap className="size-3" />
                            {row.electricityUsage} kWh
                            <Droplets className="ml-2 size-3" />
                            {row.waterUsage} m³
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-success">
                            +{formatCurrency(SERVICE_PROFIT)}
                          </p>
                          <p className="text-muted-foreground text-[10px]">
                            Lãi dịch vụ
                          </p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">
                      Cảnh báo thất thoát
                    </CardTitle>
                    <CardDescription>
                      Hệ thống phát hiện chênh lệch bất thường
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <EmptyPanel
                      title="Không có cảnh báo"
                      description="Mọi chỉ số đều nằm trong ngưỡng an toàn."
                    />
                  </CardContent>
                </Card>
              </div>
            )}
          </QuerySection>
        </TabsContent>

        <TabsContent value="overdue">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <AlertCircle className="text-destructive size-4" />
                Danh sách công nợ quá hạn
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <QuerySection
                query={overdueQuery}
                errorText="Không thể tải danh sách công nợ."
                loading={
                  <CardGridSkeleton itemCount={3} className="grid-cols-1" />
                }
              >
                {(overdueDebts) =>
                  overdueDebts.length > 0 ? (
                    overdueDebts.map((debt) => (
                      <div
                        key={debt.id}
                        className="hover:bg-muted/50 flex items-start justify-between gap-4 rounded-lg border p-3"
                      >
                        <div>
                          <p className="font-medium">{debt.tenant}</p>
                          <p className="text-muted-foreground text-sm">
                            {debt.room}
                          </p>
                          <p className="text-destructive mt-1 text-xs">
                            {debt.reason}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-destructive font-semibold tabular-nums">
                            {formatCurrency(debt.amount)}
                          </p>
                          <p className="text-muted-foreground text-xs">
                            Quá hạn {debt.daysOverdue} ngày
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <EmptyPanel
                      title="Không có công nợ quá hạn"
                      description="Danh sách trống trong kỳ báo cáo hiện tại."
                    />
                  )
                }
              </QuerySection>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Hiệu suất lấp đầy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <QuerySection
                query={rowsQuery}
                errorText={ROWS_ERROR}
                loading={
                  <CardGridSkeleton itemCount={3} className="grid-cols-1" />
                }
              >
                {() =>
                  rows.length > 0 ? (
                    rows.map((row) => (
                      <OccupancyBar
                        key={rowKey(row)}
                        rate={row.occupancyRate}
                        label={`${row.building} - ${row.floor}`}
                      />
                    ))
                  ) : (
                    <p className="text-muted-foreground text-sm">
                      Không có dữ liệu cho bộ lọc hiện tại.
                    </p>
                  )
                }
              </QuerySection>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
