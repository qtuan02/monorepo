import { Activity, FileText, Plus, Receipt } from "lucide-react";

import { Button } from "@monorepo/ui/components/button";

import { SummaryCard } from "~/components/card/summary-card";
import { DataTable } from "~/components/data-table/data-table";
import { ListPageHeader } from "~/components/page/list-page-header";
import { ErrorPanel } from "~/components/panel/error-panel";
import { LoadingPanel } from "~/components/panel/loading-panel";
import { toDistinctOptions } from "~/constants/status";
import { expenseColumns } from "~/features/expenses/components/expense-columns";
import { getExpenseStats } from "~/features/expenses/utils/expense-stats";
import { useGetExpenses } from "~/hooks/api/expense";
import { useBuildingStore } from "~/stores/use-building-store";
import { formatCurrency } from "~/utils/currency";

/**
 * "Chi phí vận hành": the three KPIs over the scoped list, then the table.
 * "Thêm chi phí" has no flow yet, as in the prototype.
 */
export default function ExpenseListTemplate() {
  const selectedBuildingId = useBuildingStore((s) => s.selectedBuildingId);
  const { data, isLoading, isError, refetch } = useGetExpenses({
    buildingId: selectedBuildingId,
  });
  const expenses = data ?? [];
  const stats = getExpenseStats(expenses);

  return (
    <div className="space-y-6">
      <ListPageHeader
        title="Chi phí vận hành"
        description="Theo dõi các khoản chi nội bộ, bảo trì và vận hành theo từng tòa nhà."
        actions={
          <Button type="button" size="sm">
            <Plus />
            Thêm chi phí
          </Button>
        }
      />

      {isLoading ? (
        <LoadingPanel itemCount={6} />
      ) : isError ? (
        <ErrorPanel
          description="Không tải được danh sách chi phí."
          action={{ label: "Thử lại", onClick: () => refetch() }}
        />
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <SummaryCard
              label="Tổng chi phí"
              value={formatCurrency(stats.totalAmount)}
              icon={Receipt}
            />
            <SummaryCard
              label="Số phiếu chi"
              value={stats.totalCount}
              icon={Activity}
              iconClassName="bg-blue-100 text-blue-600"
            />
            <SummaryCard
              label="Trung bình/khoản"
              value={formatCurrency(stats.averageAmount)}
              icon={Receipt}
              iconClassName="bg-amber-100 text-amber-600"
            />
          </div>

          <DataTable
            columns={expenseColumns}
            data={expenses}
            getRowId={(expense) => expense.id}
            search={{ columnId: "description", placeholder: "Tìm mô tả..." }}
            facets={[
              {
                columnId: "category",
                title: "Danh mục",
                options: toDistinctOptions(
                  expenses.map((expense) => expense.category),
                ),
              },
            ]}
            empty={{
              icon: FileText,
              title: "Không tìm thấy phiếu chi",
              description:
                "Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm để xem kết quả.",
            }}
            resultLabel={(count) => `${count} phiếu chi được tìm thấy`}
          />
        </>
      )}
    </div>
  );
}
