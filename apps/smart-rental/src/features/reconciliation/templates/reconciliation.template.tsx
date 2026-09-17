import { Receipt } from "lucide-react";

import { KpiStrip, KpiStripSkeleton } from "~/components/card/kpi-strip";
import { DataTable } from "~/components/data-table/data-table";
import { ListPageHeader } from "~/components/page/list-page-header";
import { ErrorPanel } from "~/components/panel/error-panel";
import { TableSkeleton } from "~/components/panel/loading-panel";
import {
  reconciliationStatusConfig,
  toFilterOptions,
} from "~/constants/status";
import { reconciliationColumns } from "~/features/reconciliation/components/reconciliation-columns";
import { getReconciliationStats } from "~/features/reconciliation/utils/reconciliation-stats";
import { useGetReconciliationItems } from "~/hooks/api/reconciliation";
import { useBuildingStore } from "~/stores/use-building-store";
import { formatCurrency } from "~/utils/currency";

/**
 * "Đối soát" (ADR-0011): the four totals over the scoped lines, then the
 * income-versus-expense table. The lines come from their own Mock rather
 * than from Hoá đơn and Hoá đơn nhà cung cấp, as in the prototype.
 */
export default function ReconciliationTemplate() {
  const selectedBuildingId = useBuildingStore((s) => s.selectedBuildingId);
  const { data, isLoading, isError, refetch } = useGetReconciliationItems({
    buildingId: selectedBuildingId,
  });
  const items = data ?? [];
  const stats = getReconciliationStats(items);

  return (
    <div className="space-y-6">
      <ListPageHeader
        title="Đối soát"
        description="So sánh giữa số tiền thu từ Người thuê và chi trả cho nhà cung cấp theo hạng mục dịch vụ."
      />

      {isLoading ? (
        <div className="space-y-6">
          <KpiStripSkeleton />
          <TableSkeleton />
        </div>
      ) : isError ? (
        <ErrorPanel
          description="Không tải được dữ liệu đối soát."
          action={{ label: "Thử lại", onClick: () => refetch() }}
        />
      ) : (
        <>
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
              {
                label: "Tỷ suất lợi nhuận",
                value: `${stats.profitMargin}%`,
              },
            ]}
          />

          <DataTable
            columns={reconciliationColumns}
            data={items}
            getRowId={(item) => item.id}
            search={{
              columnId: "lineItemName",
              placeholder: "Tìm hạng mục...",
            }}
            facets={[
              {
                columnId: "status",
                title: "Trạng thái",
                options: toFilterOptions(reconciliationStatusConfig),
              },
            ]}
            empty={{
              icon: Receipt,
              title: "Không có dữ liệu đối soát",
              description:
                "Dữ liệu sẽ hiển thị khi có hoá đơn Người thuê và hoá đơn nhà cung cấp trong cùng kỳ.",
            }}
            resultLabel={(count) => `${count} hạng mục được tìm thấy`}
          />
        </>
      )}
    </div>
  );
}
