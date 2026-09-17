import { Activity, AlertCircle, Clock, FileText, Plus } from "lucide-react";
import { Link } from "react-router";

import { Button, buttonVariants } from "@monorepo/ui/components/button";

import { SummaryCard } from "~/components/card/summary-card";
import { DataTable } from "~/components/data-table/data-table";
import {
  ListViewSwitch,
  ListViewTabs,
  useListView,
} from "~/components/data-table/list-view";
import { ListPageHeader } from "~/components/page/list-page-header";
import { ErrorPanel } from "~/components/panel/error-panel";
import { LoadingPanel } from "~/components/panel/loading-panel";
import { ROUTES } from "~/constants/routes";
import {
  toFilterOptions,
  utilityStatusConfig,
  utilityTypeConfig,
} from "~/constants/status";
import UtilityCard from "~/features/utilities/components/utility-card";
import { utilityColumns } from "~/features/utilities/components/utility-columns";
import { calculateUtilityStats } from "~/features/utilities/utils/meter-reading";
import { useGetUtilities } from "~/hooks/api/utility";
import { useBuildingStore } from "~/stores/use-building-store";

/**
 * "Chỉ số điện nước" (ADR-0011 — the heading now matches the glossary's
 * name). Three KPI tiles over the list composite, cards or table by
 * `?view=`. "Lịch sử chốt" has no flow yet, as in the prototype; "Thêm chỉ
 * số" leads to the meter-input screen.
 */
export default function UtilityListTemplate() {
  const [view, setView] = useListView();
  const selectedBuildingId = useBuildingStore((s) => s.selectedBuildingId);
  const { data, isLoading, isError, refetch } = useGetUtilities({
    buildingId: selectedBuildingId,
  });

  const stats = calculateUtilityStats(data ?? []);

  return (
    <div className="space-y-6">
      <ListPageHeader
        title="Chỉ số điện nước"
        description="Quản lý chỉ số điện nước và tiêu thụ hàng tháng."
        actions={
          <>
            <Button type="button" variant="outline" size="sm">
              Lịch sử chốt
            </Button>
            <Link
              to={ROUTES.METER_INPUT}
              className={buttonVariants({ size: "sm" })}
            >
              <Plus />
              Thêm chỉ số
            </Link>
          </>
        }
      />

      {isLoading ? (
        <LoadingPanel />
      ) : isError ? (
        <ErrorPanel
          description="Không tải được danh sách chỉ số."
          action={{ label: "Thử lại", onClick: () => refetch() }}
        />
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <SummaryCard
              label="Tổng chỉ số"
              value={stats.totalReadings}
              icon={Activity}
            />
            <SummaryCard
              label="Bất thường"
              value={stats.anomalyCount}
              icon={AlertCircle}
              iconClassName="bg-destructive/10 text-destructive"
            />
            <SummaryCard
              label="Chờ xác minh"
              value={stats.pendingVerifyCount}
              icon={Clock}
              iconClassName="bg-info/10 text-info"
              className="sm:col-span-2 lg:col-span-1"
            />
          </div>

          <ListViewTabs view={view} onViewChange={setView}>
            <DataTable
              columns={utilityColumns}
              data={data ?? []}
              getRowId={(utility) => utility.id}
              search={{ columnId: "roomName", placeholder: "Tìm tên phòng..." }}
              facets={[
                {
                  columnId: "status",
                  title: "Trạng thái",
                  options: toFilterOptions(utilityStatusConfig),
                },
                {
                  columnId: "type",
                  title: "Loại tiện ích",
                  options: toFilterOptions(utilityTypeConfig),
                },
              ]}
              empty={{
                icon: FileText,
                title: "Không có dữ liệu",
                description:
                  "Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm để xem kết quả.",
              }}
              resultLabel={(count) => `${count} chỉ số được tìm thấy`}
              viewSwitch={<ListViewSwitch />}
              renderRows={
                view === "grid"
                  ? (utilities) => (
                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {utilities.map((utility) => (
                          <UtilityCard key={utility.id} utility={utility} />
                        ))}
                      </div>
                    )
                  : undefined
              }
            />
          </ListViewTabs>
        </>
      )}
    </div>
  );
}
