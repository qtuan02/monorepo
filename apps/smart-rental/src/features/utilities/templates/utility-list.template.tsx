import { FileText } from "lucide-react";

import { KpiStrip, KpiStripSkeleton } from "~/components/card/kpi-strip";
import { DataTable } from "~/components/data-table/data-table";
import { ListViewSwitch, useListView } from "~/components/data-table/list-view";
import { ListPageHeader } from "~/components/page/list-page-header";
import { ErrorPanel } from "~/components/panel/error-panel";
import { CardGridSkeleton } from "~/components/panel/loading-panel";
import {
  toFilterOptions,
  utilityStatusConfig,
  utilityTypeConfig,
} from "~/constants/status";
import UtilityCard from "~/features/utilities/components/utility-card";
import { utilityColumns } from "~/features/utilities/components/utility-columns";
import UtilityMobileRow from "~/features/utilities/components/utility-mobile-row";
import { calculateUtilityStats } from "~/features/utilities/utils/meter-reading";
import { useGetUtilities } from "~/hooks/api/utility";
import { useBuildingStore } from "~/stores/use-building-store";
import { formatMonth } from "~/utils/date";

/**
 * "Chỉ số điện nước" — lịch sử chỉ đọc từ ADR-0013: nhập/chốt chỉ số giờ
 * sống ở màn "Kỳ điện nước & hoá đơn" (`/cycles/:month`), nên màn này không
 * còn nút nhập. Ba KPI tile trên list composite, cards hoặc table theo
 * `?view=`.
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
        description="Lịch sử chỉ số điện nước và tiêu thụ hàng tháng."
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
              { label: "Đã chốt", value: stats.finalizedCount },
              { label: "Nháp", value: stats.draftCount },
              { label: "Bất thường", value: stats.anomalyCount },
            ]}
          />

          <DataTable
            columns={utilityColumns}
            data={data ?? []}
            getRowId={(utility) => utility.id}
            search={{ columnId: "roomName", placeholder: "Tìm tên phòng..." }}
            facets={[
              {
                columnId: "type",
                title: "Loại",
                options: toFilterOptions(utilityTypeConfig),
              },
              {
                columnId: "status",
                title: "Trạng thái",
                options: toFilterOptions(utilityStatusConfig),
              },
              {
                columnId: "month",
                title: "Kỳ",
                options: [...new Set((data ?? []).map((u) => u.month))]
                  .sort()
                  .reverse()
                  .map((month) => ({
                    value: month,
                    label: formatMonth(month),
                  })),
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
            renderMobileRow={(utility) => (
              <UtilityMobileRow utility={utility} />
            )}
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
