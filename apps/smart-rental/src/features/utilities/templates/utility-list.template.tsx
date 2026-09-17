import { FileText, Plus } from "lucide-react";
import { Link } from "react-router";

import { Button, buttonVariants } from "@monorepo/ui/components/button";

import { KpiStrip, KpiStripSkeleton } from "~/components/card/kpi-strip";
import { DataTable } from "~/components/data-table/data-table";
import { ListViewSwitch, useListView } from "~/components/data-table/list-view";
import { ListPageHeader } from "~/components/page/list-page-header";
import { ErrorPanel } from "~/components/panel/error-panel";
import { CardGridSkeleton } from "~/components/panel/loading-panel";
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
        <div className="space-y-6">
          <KpiStripSkeleton count={3} />
          <CardGridSkeleton />
        </div>
      ) : isError ? (
        <ErrorPanel
          description="Không tải được danh sách chỉ số."
          action={{ label: "Thử lại", onClick: () => refetch() }}
        />
      ) : (
        <>
          <KpiStrip
            items={[
              { label: "Tổng chỉ số", value: stats.totalReadings },
              { label: "Bất thường", value: stats.anomalyCount },
              { label: "Chờ xác minh", value: stats.pendingVerifyCount },
            ]}
          />

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
            viewSwitch={<ListViewSwitch view={view} onViewChange={setView} />}
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
        </>
      )}
    </div>
  );
}
