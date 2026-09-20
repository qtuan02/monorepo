import { useState } from "react";
import { FileText, Plus } from "lucide-react";

import { Button } from "@monorepo/ui/components/button";

import { KpiStrip, KpiStripSkeleton } from "~/components/card/kpi-strip";
import { DataTable } from "~/components/data-table/data-table";
import { ListPageHeader } from "~/components/page/list-page-header";
import { toDistinctOptions } from "~/constants/status";
import { expenseColumns } from "~/features/expenses/components/expense-columns";
import ExpenseFormSheet from "~/features/expenses/components/expense-form-sheet";
import { getExpenseStats } from "~/features/expenses/utils/expense-stats";
import { useGetExpenses } from "~/hooks/api/expense";
import { useBuildingStore } from "~/stores/use-building-store";
import { formatCurrency } from "~/utils/currency";

/**
 * "Chi phí" (ADR-0011): the three KPIs over the scoped list, then the table.
 */
export default function ExpenseListTemplate() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const selectedBuildingId = useBuildingStore((s) => s.selectedBuildingId);
  const expensesQuery = useGetExpenses({ buildingId: selectedBuildingId });
  const expenses = expensesQuery.data ?? [];
  const stats = getExpenseStats(expenses);

  return (
    <div className="space-y-6">
      <ListPageHeader
        title="Chi phí"
        description="Theo dõi các khoản chi nội bộ, bảo trì và vận hành theo từng toà nhà."
        actions={
          <Button type="button" size="sm" onClick={() => setIsFormOpen(true)}>
            <Plus />
            Thêm chi phí
          </Button>
        }
        mobileAction={
          <Button
            type="button"
            size="icon-sm"
            aria-label="Tạo chi phí"
            onClick={() => setIsFormOpen(true)}
          >
            <Plus />
          </Button>
        }
      />

      {expensesQuery.isLoading ? (
        <KpiStripSkeleton count={3} />
      ) : (
        !expensesQuery.isError && (
          <KpiStrip
            items={[
              {
                label: "Tổng chi phí",
                value: formatCurrency(stats.totalAmount),
              },
              { label: "Số phiếu chi", value: stats.totalCount },
              {
                label: "Trung bình/khoản",
                value: formatCurrency(stats.averageAmount),
              },
            ]}
          />
        )
      )}

      <DataTable
        columns={expenseColumns}
        query={expensesQuery}
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
        empty={{ icon: FileText, title: "Không tìm thấy phiếu chi" }}
        entityLabel="phiếu chi"
      />

      <ExpenseFormSheet
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        defaultBuildingId={selectedBuildingId}
      />
    </div>
  );
}
