import { Building2, DollarSign, TrendingUp, UserCheck } from "lucide-react";

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
import { cn } from "@monorepo/ui/utils/cn";

import { SummaryCard } from "~/components/card/summary-card";
import { ListPageHeader } from "~/components/page/list-page-header";
import { ErrorPanel } from "~/components/panel/error-panel";
import { LoadingPanel } from "~/components/panel/loading-panel";
import { statusTone } from "~/constants/status";
import CashFlowChart from "~/features/dashboard/components/cash-flow-chart";
import OccupancyDonutChart from "~/features/dashboard/components/occupancy-donut-chart";
import PendingTasksCard from "~/features/dashboard/components/pending-tasks-card";
import RecentActivitiesCard from "~/features/dashboard/components/recent-activities-card";
import RevenueChart from "~/features/dashboard/components/revenue-chart";
import { useGetDashboard } from "~/hooks/api/dashboard";
import { useBuildingStore } from "~/stores/use-building-store";
import { formatMillions } from "~/utils/currency";

/**
 * "Tổng quan": the prototype's dashboard — four KPIs, revenue and cash flow
 * behind two tabs, the occupancy donut, then tasks and activities — read for
 * the Building scope, which is a query param as it will be on the backend.
 * The heading is the screen's name rather than the prototype's "Xin chào!",
 * which moves down to the description: the sidebar, the header and the seam
 * test all call this screen "Tổng quan".
 */
export default function DashboardTemplate() {
  const selectedBuildingId = useBuildingStore((s) => s.selectedBuildingId);
  const { data, isLoading, isError, refetch } = useGetDashboard({
    buildingId: selectedBuildingId ?? undefined,
  });

  return (
    <div className="space-y-6">
      <ListPageHeader
        title="Tổng quan"
        description="Xin chào! 👋 Đây là tổng quan hoạt động quản lý phòng trọ trong tháng này."
      />

      {isLoading ? (
        <LoadingPanel itemCount={4} className="lg:grid-cols-4" />
      ) : isError || !data ? (
        <ErrorPanel
          description="Không tải được số liệu tổng quan."
          action={{ label: "Thử lại", onClick: () => refetch() }}
        />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <SummaryCard
              label="Tổng số phòng"
              value={data.totalRooms}
              description="trên toàn bộ tòa nhà"
              icon={Building2}
              trend={{ value: "+12", isPositive: true }}
            />
            <SummaryCard
              label="Tỷ lệ lấp đầy"
              value={`${data.occupancyRate}%`}
              description="hiệu suất tối ưu"
              icon={UserCheck}
              trend={{ value: "+2.5%", isPositive: true }}
            />
            <SummaryCard
              label="Doanh thu tháng"
              value={formatMillions(data.monthlyRevenue)}
              description="kỳ báo cáo tháng 4"
              icon={DollarSign}
              trend={{ value: "+15.3%", isPositive: true }}
            />
            <SummaryCard
              label="Chi phí vận hành"
              value={formatMillions(data.operatingCost)}
              description="tiền điện, nước, dịch vụ"
              icon={TrendingUp}
              trend={{ value: "-4.2%", isPositive: false }}
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-7">
            <Card className="lg:col-span-4">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle className="text-base font-semibold">
                    Doanh thu & Thu chi
                  </CardTitle>
                  <CardDescription>
                    Xu hướng tài chính trong 6 tháng qua
                  </CardDescription>
                </div>
                <div
                  className={cn(
                    "flex items-center gap-1 rounded-full border px-2 py-1 text-xs",
                    statusTone.success,
                  )}
                >
                  <TrendingUp className="size-3.5" />
                  <span className="font-medium">+12.3% tháng này</span>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="revenue">
                  <TabsList>
                    <TabsTrigger value="revenue">Doanh thu</TabsTrigger>
                    <TabsTrigger value="cashflow">Thu vs Chi</TabsTrigger>
                  </TabsList>
                  <TabsContent value="revenue">
                    <RevenueChart data={data.revenueByMonth} />
                  </TabsContent>
                  <TabsContent value="cashflow">
                    <CashFlowChart data={data.cashFlowByMonth} />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle className="text-base font-semibold">
                  Tỷ lệ lấp đầy
                </CardTitle>
                <CardDescription>
                  Trạng thái phòng hiện tại của tòa nhà
                </CardDescription>
              </CardHeader>
              <CardContent>
                <OccupancyDonutChart occupancy={data.occupancy} />
              </CardContent>
            </Card>

            <div className="lg:col-span-4">
              <PendingTasksCard tasks={data.pendingTasks} />
            </div>
            <div className="lg:col-span-3">
              <RecentActivitiesCard activities={data.recentActivities} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
