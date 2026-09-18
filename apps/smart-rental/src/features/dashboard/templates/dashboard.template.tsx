import { Link } from "react-router";

import { buttonVariants } from "@monorepo/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@monorepo/ui/components/card";

import { KpiStrip, KpiStripSkeleton } from "~/components/card/kpi-strip";
import { RevenueChart } from "~/components/chart/revenue-chart";
import { ListPageHeader } from "~/components/page/list-page-header";
import { ErrorPanel } from "~/components/panel/error-panel";
import { TaskQueue } from "~/components/queue/task-queue";
import { ROUTES } from "~/constants/routes";
import OccupancyDonutChart from "~/features/dashboard/components/occupancy-donut-chart";
import { useGetDashboard } from "~/hooks/api/dashboard";
import { useGetTasks } from "~/hooks/api/task";
import { useBuildingStore } from "~/stores/use-building-store";
import { formatCurrency } from "~/utils/currency";
import { formatFullDate } from "~/utils/date";

/**
 * "Hôm nay" (ADR-0011, spec #153 §3.2): the landlord's first screen — three
 * KPIs for the Building scope, the Việc cần làm queue with an action per
 * item, then the occupancy donut and the six-month revenue trend. The
 * heading names the day, the way the mockup does — "Hôm nay" itself is the
 * sidebar/header's name for this area, not the page's own `<h1>`.
 */
export default function DashboardTemplate() {
  const selectedBuildingId = useBuildingStore((s) => s.selectedBuildingId);
  const dashboardQuery = useGetDashboard({ buildingId: selectedBuildingId });
  const tasksQuery = useGetTasks({ buildingId: selectedBuildingId });
  const data = dashboardQuery.data;

  return (
    <div className="space-y-6">
      <ListPageHeader
        title={formatFullDate()}
        description={
          data
            ? `${data.occupancy.occupied + data.occupancy.vacant} Phòng · ${data.occupancy.occupied} đang thuê`
            : "Tổng quan hoạt động quản lý phòng trọ."
        }
        actions={
          <Link
            to={ROUTES.INVOICE_BATCH}
            className={buttonVariants({ size: "sm" })}
          >
            Lập đợt hoá đơn
          </Link>
        }
      />

      {dashboardQuery.isLoading ? (
        <KpiStripSkeleton count={3} />
      ) : dashboardQuery.isError || !data ? (
        <ErrorPanel
          description="Không tải được số liệu tổng quan."
          action={{ label: "Thử lại", onClick: () => dashboardQuery.refetch() }}
        />
      ) : (
        <>
          <KpiStrip
            items={[
              {
                label: "Cần thu tháng này",
                value: formatCurrency(data.dueThisMonth.amount),
                description: `${data.dueThisMonth.count} Hoá đơn`,
              },
              {
                label: "Quá hạn",
                value: `${data.overdue.count} Hoá đơn`,
                description:
                  data.overdue.count > 0
                    ? `${formatCurrency(data.overdue.amount)} · lâu nhất ${data.overdue.maxDaysOverdue} ngày`
                    : undefined,
              },
              {
                label: "Hợp đồng hết hạn trong 30 ngày",
                value: data.expiringContracts.count,
                description:
                  data.expiringContracts.count > 0
                    ? `gần nhất ${data.expiringContracts.nearestEndDate} · ${data.expiringContracts.nearestRoom}`
                    : undefined,
              },
            ]}
          />

          <div className="grid gap-4 lg:grid-cols-7">
            <Card className="lg:col-span-4">
              <CardHeader>
                <CardTitle className="text-base font-semibold">
                  Cần làm hôm nay
                </CardTitle>
              </CardHeader>
              <CardContent>
                {tasksQuery.isLoading ? (
                  <p className="text-muted-foreground text-sm">Đang tải…</p>
                ) : (
                  <TaskQueue tasks={tasksQuery.data ?? []} />
                )}
              </CardContent>
            </Card>

            <div className="flex flex-col gap-4 lg:col-span-3">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-semibold">
                    Lấp đầy
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <OccupancyDonutChart occupancy={data.occupancy} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-semibold">
                    Doanh thu 6 tháng
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <RevenueChart data={data.revenueByMonth} />
                </CardContent>
              </Card>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
