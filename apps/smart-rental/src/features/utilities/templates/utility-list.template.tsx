import { FileText } from "lucide-react";

import { KpiStrip, KpiStripSkeleton } from "~/components/card/kpi-strip";
import { DataTable } from "~/components/data-table/data-table";
import { ListPageHeader } from "~/components/page/list-page-header";
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
  const selectedBuildingId = useBuildingStore((s) => s.selectedBuildingId);
  const utilitiesQuery = useGetUtilities({ buildingId: selectedBuildingId });
  const utilities = utilitiesQuery.data ?? [];
  const stats = calculateUtilityStats(utilities);

  return (
    <div className="space-y-6">
      <ListPageHeader
        title="Chỉ số điện nước"
        description="Lịch sử chỉ số điện nước và tiêu thụ hàng tháng."
      />

      {utilitiesQuery.isLoading ? (
        <KpiStripSkeleton count={3} />
      ) : (
        !utilitiesQuery.isError && (
          <KpiStrip
            items={[
              { label: "Đã chốt", value: stats.finalizedCount },
              { label: "Nháp", value: stats.draftCount },
              { label: "Bất thường", value: stats.anomalyCount },
            ]}
          />
        )
      )}

      <DataTable
        columns={utilityColumns}
        query={utilitiesQuery}
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
            options: [...new Set(utilities.map((u) => u.month))]
              .sort()
              .reverse()
              .map((month) => ({
                value: month,
                label: formatMonth(month),
              })),
          },
        ]}
        empty={{ icon: FileText, title: "Không có dữ liệu" }}
        entityLabel="chỉ số"
        renderMobileRow={(utility) => <UtilityMobileRow utility={utility} />}
        card={(utility) => <UtilityCard utility={utility} />}
      />
    </div>
  );
}
