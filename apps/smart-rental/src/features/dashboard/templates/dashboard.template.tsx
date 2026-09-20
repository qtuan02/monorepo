import { Link } from "react-router";

import { buttonVariants } from "@monorepo/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@monorepo/ui/components/card";

import { InfoCard, InfoRow } from "~/components/card/info-card";
import { KpiStrip, KpiStripSkeleton } from "~/components/card/kpi-strip";
import { ListPageHeader } from "~/components/page/list-page-header";
import { ErrorPanel } from "~/components/panel/error-panel";
import { TaskQueue } from "~/components/queue/task-queue";
import { ROUTES } from "~/constants/routes";
import { useGetDashboard } from "~/hooks/api/dashboard";
import { useGetTaskQueueEntries } from "~/hooks/api/task-queue";
import { useBuildingStore } from "~/stores/use-building-store";
import { formatCurrency } from "~/utils/currency";
import { resolveNextCycleAction } from "~/utils/cycle-progress";
import { formatDate, formatFullDate, formatMonth } from "~/utils/date";

/**
 * "Hôm nay" (spec #179 §"Hôm nay"): a real hàng đợi — three KPIs that never
 * repeat a number, the gộp queue sorted by hạn, then "Tháng này" và "Vừa
 * xong" as số cards. The donut and 6-tháng chart both moved to Báo cáo; the
 * heading names the day, "Hôm nay" itself is the sidebar/header's name for
 * this area, not the page's own `<h1>`.
 */
export default function DashboardTemplate() {
  const selectedBuildingId = useBuildingStore((s) => s.selectedBuildingId);
  const dashboardQuery = useGetDashboard({ buildingId: selectedBuildingId });
  const { entries, isLoading: isQueueLoading } =
    useGetTaskQueueEntries(selectedBuildingId);
  const data = dashboardQuery.data;

  const nextAction = data ? resolveNextCycleAction(data.cycleProgress) : null;

  return (
    <div className="space-y-6">
      <ListPageHeader
        title={formatFullDate()}
        description={
          data
            ? `${entries.length} việc cần làm · ${data.monthSummary.totalRooms} Phòng, ${data.monthSummary.occupiedRooms} đang thuê`
            : "Việc cần làm hôm nay."
        }
        actions={
          // Việc kế tiếp của tháng (spec #179 §"Hôm nay" decision 21) — ẩn
          // khi scope null, vì màn Kỳ đòi đúng một Toà nhà.
          selectedBuildingId && nextAction ? (
            <Link
              to={ROUTES.cycleDetailPath(nextAction.month)}
              className={buttonVariants({ size: "sm" })}
            >
              {nextAction.label}
            </Link>
          ) : undefined
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
                label: "Còn phải thu tháng này",
                value: formatCurrency(data.outstandingThisMonth.amount),
                description:
                  data.outstandingThisMonth.overdueCount > 0
                    ? `${data.outstandingThisMonth.overdueCount} Hoá đơn quá hạn`
                    : undefined,
              },
              {
                label: "Hợp đồng sắp hết hạn",
                value: data.expiringContracts.count,
                description: data.expiringContracts.nearestEndDate
                  ? `gần nhất ${formatDate(data.expiringContracts.nearestEndDate)}`
                  : undefined,
              },
              {
                label: `Chỉ số Kỳ ${formatMonth(data.cycleProgress.month)}`,
                value: `${data.cycleProgress.entered}/${data.cycleProgress.total} phòng`,
                description:
                  data.cycleProgress.anomalyCount > 0
                    ? `${data.cycleProgress.anomalyCount} bất thường · chưa lập Đợt`
                    : !data.cycleProgress.allInvoiced
                      ? "chưa lập Đợt"
                      : undefined,
              },
            ]}
          />

          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">
                Cần làm hôm nay
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isQueueLoading ? (
                <p className="text-muted-foreground text-sm">Đang tải…</p>
              ) : (
                <TaskQueue entries={entries} />
              )}
            </CardContent>
          </Card>

          <div className="grid gap-4 lg:grid-cols-2">
            <InfoCard title={`Tháng này · ${data.monthSummary.month}`}>
              <InfoRow
                label="Lấp đầy"
                value={`${data.monthSummary.occupiedRooms} / ${data.monthSummary.totalRooms} phòng`}
              />
              <InfoRow
                label="Đã lập hoá đơn"
                value={formatCurrency(data.monthSummary.invoicedAmount)}
              />
              <InfoRow
                label="Đã thu"
                value={formatCurrency(data.monthSummary.collectedAmount)}
                isHighlighted
              />
              <InfoRow
                label="Còn phải thu"
                value={formatCurrency(data.monthSummary.outstandingAmount)}
                isHighlighted
              />
              <Link
                to={ROUTES.REPORTS}
                className="text-primary block text-right text-sm underline underline-offset-4"
              >
                Xem Báo cáo →
              </Link>
            </InfoCard>

            <InfoCard title="Vừa xong">
              {data.recentActivity.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  Chưa có hoạt động nào.
                </p>
              ) : (
                data.recentActivity.map((entry) => (
                  <InfoRow
                    key={`${entry.kind}-${entry.at}-${entry.label}`}
                    label={entry.label}
                    value={entry.detail}
                  />
                ))
              )}
            </InfoCard>
          </div>
        </>
      )}
    </div>
  );
}
