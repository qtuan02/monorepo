import { useState } from "react";
import {
  AlertCircle,
  Download,
  TrendingDown,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { useSearchParams } from "react-router";

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

import { SummaryCard } from "~/components/card/summary-card";
import { ListPageHeader } from "~/components/page/list-page-header";
import { EmptyPanel } from "~/components/panel/empty-panel";
import { ErrorPanel } from "~/components/panel/error-panel";
import { LoadingPanel } from "~/components/panel/loading-panel";
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
import { formatCurrency } from "~/utils/currency";

const TAB_PARAM = "tab";
const TABS = ["pnl", "utilities", "overdue", "performance"] as const;
type Tab = (typeof TABS)[number];

/** The prototype's fixed figure — one "Lãi dịch vụ" per floor, no calculation behind it. */
const SERVICE_PROFIT = 850000;

/**
 * "Báo cáo": KPI cards over the P&L summary, then four tabs — the tab rides
 * on the URL, the three filters stay in state as in the prototype. "Xuất báo
 * cáo" only toasts; the export has no flow yet.
 */
export default function ReportsOverviewTemplate() {
  const [searchParams, setSearchParams] = useSearchParams();
  const rawTab = searchParams.get(TAB_PARAM);
  const tab: Tab = TABS.includes(rawTab as Tab) ? (rawTab as Tab) : "pnl";
  const [filters, setFilters] = useState(defaultReportFilters);

  const rowsQuery = useGetReportRows();
  const summaryQuery = useGetProfitLossSummary();
  const overdueQuery = useGetOverdueDebts();

  const setTab = (next: string) =>
    setSearchParams(
      (previous) => {
        const params = new URLSearchParams(previous);
        if (next === "pnl") params.delete(TAB_PARAM);
        else params.set(TAB_PARAM, next);
        return params;
      },
      { replace: true },
    );

  const allRows = rowsQuery.data ?? [];
  const rows = filterReportRows(allRows, filters);
  const buildings = [...new Set(allRows.map((row) => row.building))];
  const floors = [...new Set(allRows.map((row) => row.floor))];
  const summary = summaryQuery.data;
  const overdueDebts = overdueQuery.data ?? [];

  const isLoading =
    rowsQuery.isLoading || summaryQuery.isLoading || overdueQuery.isLoading;
  const isError =
    rowsQuery.isError || summaryQuery.isError || overdueQuery.isError;

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
            onClick={() =>
              toast.add({
                title: "Chức năng xuất báo cáo",
                description: "Tính năng sẽ được bổ sung trong phiên bản sau.",
              })
            }
          >
            <Download />
            Xuất báo cáo
          </Button>
        }
      />

      {isLoading ? (
        <LoadingPanel className="md:grid-cols-4" itemCount={4} />
      ) : isError || !summary ? (
        <ErrorPanel
          description="Không thể tải dữ liệu báo cáo."
          action={{
            label: "Thử lại",
            onClick: () => {
              void rowsQuery.refetch();
              void summaryQuery.refetch();
              void overdueQuery.refetch();
            },
          }}
        />
      ) : (
        <>
          <ReportFiltersBar
            buildings={buildings}
            floors={floors}
            filters={filters}
            onChange={setFilters}
          />

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <SummaryCard
              label="Tổng doanh thu"
              value={formatCurrency(summary.totalRevenue)}
              icon={TrendingUp}
              iconClassName="bg-emerald-100 text-emerald-600"
            />
            <SummaryCard
              label="Chi phí"
              value={formatCurrency(summary.totalExpenses)}
              icon={TrendingDown}
              iconClassName="bg-red-100 text-red-600"
            />
            <SummaryCard
              label="Lợi nhuận"
              value={formatCurrency(summary.totalProfit)}
              icon={Zap}
              iconClassName="bg-blue-100 text-blue-600"
            />
            <SummaryCard
              label="Lấp đầy phòng"
              value={`${summary.avgOccupancy}%`}
              icon={Users}
              iconClassName="bg-purple-100 text-purple-600"
            />
          </div>

          <Tabs value={tab} onValueChange={setTab} className="space-y-6">
            <TabsList className="bg-muted/50">
              <TabsTrigger value="pnl">Tổng hợp P&L</TabsTrigger>
              <TabsTrigger value="utilities">Lợi nhuận dịch vụ</TabsTrigger>
              <TabsTrigger value="overdue">Công nợ quá hạn</TabsTrigger>
              <TabsTrigger value="performance">Hiệu suất phòng</TabsTrigger>
            </TabsList>

            <TabsContent value="pnl">
              {rows.length > 0 ? (
                <ReportTable rows={rows} />
              ) : (
                <EmptyPanel
                  title="Không có dòng báo cáo"
                  description="Thử đổi bộ lọc tòa, tầng hoặc trạng thái."
                  action={{
                    label: "Đặt lại bộ lọc",
                    onClick: () => setFilters(defaultReportFilters),
                  }}
                  className="border"
                />
              )}
            </TabsContent>

            <TabsContent value="utilities">
              <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">
                      So sánh tiêu thụ & Lợi nhuận
                    </CardTitle>
                    <CardDescription>
                      Thu từ khách vs Chi cho nhà cung cấp
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {rows.map((row) => (
                      <div
                        key={`${row.month}-${row.building}-${row.floor}`}
                        className="flex items-center justify-between border-b pb-2 last:border-0"
                      >
                        <div>
                          <p className="font-medium">{row.floor}</p>
                          <p className="text-muted-foreground text-xs">
                            ⚡ {row.electricityUsage} kWh | 💧 {row.waterUsage}{" "}
                            m³
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-emerald-600">
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
                  {overdueDebts.length > 0 ? (
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
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="performance">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Hiệu suất lấp đầy</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {rows.length > 0 ? (
                    rows.map((row) => (
                      <OccupancyBar
                        key={`${row.month}-${row.building}-${row.floor}`}
                        rate={row.occupancyRate}
                        label={`${row.building} - ${row.floor}`}
                      />
                    ))
                  ) : (
                    <p className="text-muted-foreground text-sm">
                      Không có dữ liệu cho bộ lọc hiện tại.
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}
