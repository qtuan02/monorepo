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
 * "Đối soát chi phí": the four totals over the scoped lines, then the
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
        title="Đối soát chi phí"
        description="So sánh giữa số tiền thu từ khách và chi trả cho nhà cung cấp theo hạng mục dịch vụ."
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
              iconClassName="bg-emerald-100 text-emerald-600"
            />
            <SummaryCard
              label="Tổng chi dịch vụ"
              value={formatCurrency(stats.totalExpenseAmount)}
              icon={Receipt}
              iconClassName="bg-red-100 text-red-600"
            />
            <SummaryCard
              label="Chênh lệch (Lợi nhuận)"
              value={formatCurrency(stats.netProfitAmount)}
              icon={isProfit ? TrendingUp : TrendingDown}
              iconClassName={
                isProfit
                  ? "bg-blue-100 text-blue-600"
                  : "bg-orange-100 text-orange-600"
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
                "Dữ liệu sẽ hiển thị khi có hóa đơn khách thuê và hóa đơn nhà cung cấp trong cùng kỳ.",
            }}
            resultLabel={(count) => `${count} hạng mục được tìm thấy`}
          />
        </>
      )}
    </div>
  );
}
