import { Banknote, Receipt, TrendingDown, TrendingUp } from "lucide-react";

import { SummaryCard } from "~/components/card/summary-card";
import { DataTable } from "~/components/data-table/data-table";
import { ListPageHeader } from "~/components/page/list-page-header";
import { ErrorPanel } from "~/components/panel/error-panel";
import { LoadingPanel } from "~/components/panel/loading-panel";
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
  const isProfit = stats.netProfitAmount >= 0;

  return (
    <div className="space-y-6">
      <ListPageHeader
        title="Đối soát"
        description="So sánh giữa số tiền thu từ Người thuê và chi trả cho nhà cung cấp theo hạng mục dịch vụ."
      />

      {isLoading ? (
        <LoadingPanel itemCount={4} className="lg:grid-cols-4" />
      ) : isError ? (
        <ErrorPanel
          description="Không tải được dữ liệu đối soát."
          action={{ label: "Thử lại", onClick: () => refetch() }}
        />
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <SummaryCard
              label="Tổng thu dịch vụ"
              value={formatCurrency(stats.totalIncomeAmount)}
              icon={Receipt}
              iconClassName="bg-success/10 text-success"
            />
            <SummaryCard
              label="Tổng chi dịch vụ"
              value={formatCurrency(stats.totalExpenseAmount)}
              icon={Receipt}
              iconClassName="bg-destructive/10 text-destructive"
            />
            <SummaryCard
              label="Chênh lệch (Lợi nhuận)"
              value={formatCurrency(stats.netProfitAmount)}
              icon={isProfit ? TrendingUp : TrendingDown}
              iconClassName={
                isProfit ? "bg-info/10 text-info" : "bg-warning/10 text-warning"
              }
            />
            <SummaryCard
              label="Tỷ suất lợi nhuận"
              value={`${stats.profitMargin}%`}
              icon={Banknote}
            />
          </div>

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
