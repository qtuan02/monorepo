import { useState } from "react";
import { Receipt } from "lucide-react";

import dayjs from "@monorepo/dayjs";

import type { ReconciliationItem } from "~/types/reconciliation";
import { KpiStrip, KpiStripSkeleton } from "~/components/card/kpi-strip";
import { DataTable } from "~/components/data-table/data-table";
import { MonthPicker } from "~/components/form/month-picker";
import { ListPageHeader } from "~/components/page/list-page-header";
import { EmptyPanel } from "~/components/panel/empty-panel";
import { ErrorPanel } from "~/components/panel/error-panel";
import { TableSkeleton } from "~/components/panel/loading-panel";
import {
  reconciliationStatusConfig,
  toFilterOptions,
} from "~/constants/status";
import { reconciliationColumns } from "~/features/reconciliation/components/reconciliation-columns";
import { getReconciliationStats } from "~/features/reconciliation/utils/reconciliation-stats";
import { useGetBuildings } from "~/hooks/api/building";
import { useGetReconciliationItems } from "~/hooks/api/reconciliation";
import { useBuildingStore } from "~/stores/use-building-store";
import { formatCurrency } from "~/utils/currency";

interface ReconciliationBlockProps {
  title?: string;
  items: ReconciliationItem[];
}

/** One Toà nhà's worth of the four totals + the income-versus-expense table. */
function ReconciliationBlock({ title, items }: ReconciliationBlockProps) {
  const stats = getReconciliationStats(items);

  return (
    <div className="space-y-4">
      {title && <h3 className="text-lg font-semibold">{title}</h3>}
      <KpiStrip
        items={[
          {
            label: "Tổng thu dịch vụ",
            value: formatCurrency(stats.totalIncomeAmount),
          },
          {
            label: "Tổng chi dịch vụ",
            value: formatCurrency(stats.totalExpenseAmount),
          },
          {
            label: "Chênh lệch (Lợi nhuận)",
            value: formatCurrency(stats.netProfitAmount),
          },
          { label: "Tỷ suất lợi nhuận", value: `${stats.profitMargin}%` },
        ]}
      />

      <DataTable
        columns={reconciliationColumns}
        query={{
          data: items,
          isLoading: false,
          isError: false,
          refetch: () => {},
        }}
        getRowId={(item) => item.id}
        search={{ columnId: "lineItemName", placeholder: "Tìm hạng mục..." }}
        facets={[
          {
            columnId: "status",
            title: "Trạng thái",
            options: toFilterOptions(reconciliationStatusConfig),
          },
        ]}
        empty={{ icon: Receipt, title: "Không có dữ liệu đối soát" }}
        entityLabel="hạng mục"
      />
    </div>
  );
}

/**
 * "Đối soát" (spec #153 §10 row 11): a kỳ picker over the four totals + the
 * income-versus-expense table, computed live from Hoá đơn + Hoá đơn nhà cung
 * cấp + Chi phí (no Mock of its own). With a Toà nhà scope picked, one block;
 * with no scope, one block **per** Toà nhà — never one merged total.
 */
export default function ReconciliationTemplate() {
  const selectedBuildingId = useBuildingStore((s) => s.selectedBuildingId);
  const [period, setPeriod] = useState(() => dayjs().format("YYYY-MM"));
  const { data, isLoading, isError, refetch } = useGetReconciliationItems({
    buildingId: selectedBuildingId,
    period,
  });
  const buildingsQuery = useGetBuildings();
  const items = data ?? [];

  // Every Toà nhà gets a block, even one with no income or expense at all in
  // this kỳ — deriving the id list from `items` instead would silently drop
  // it (spec #153 §10 row 11: "mỗi Toà nhà một khối").
  const buildingIds = selectedBuildingId
    ? [selectedBuildingId]
    : (buildingsQuery.data ?? []).map((building) => building.id);
  const buildingName = (buildingId: string) =>
    buildingsQuery.data?.find((building) => building.id === buildingId)?.name ??
    buildingId;

  return (
    <div className="space-y-6">
      <ListPageHeader
        title="Đối soát"
        description="So sánh giữa số tiền thu từ Người thuê và chi trả cho nhà cung cấp theo hạng mục dịch vụ, theo từng kỳ."
        actions={
          <MonthPicker
            value={period}
            onChange={setPeriod}
            aria-label="Chọn kỳ đối soát"
          />
        }
      />

      {isLoading || buildingsQuery.isLoading ? (
        <div className="space-y-6">
          <KpiStripSkeleton />
          <TableSkeleton />
        </div>
      ) : isError || buildingsQuery.isError ? (
        <ErrorPanel
          description="Không tải được dữ liệu đối soát."
          action={{ label: "Thử lại", onClick: () => refetch() }}
        />
      ) : buildingIds.length === 0 ? (
        <EmptyPanel
          icon={Receipt}
          title="Không có dữ liệu đối soát"
          description="Chưa có hoá đơn hay khoản chi nào trong kỳ này."
          className="border"
        />
      ) : (
        buildingIds.map((buildingId) => (
          <ReconciliationBlock
            key={buildingId}
            title={selectedBuildingId ? undefined : buildingName(buildingId)}
            items={items.filter((item) => item.buildingId === buildingId)}
          />
        ))
      )}
    </div>
  );
}
