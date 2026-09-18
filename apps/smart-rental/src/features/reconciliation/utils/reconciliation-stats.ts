import type { ReconciliationItem } from "~/types/reconciliation";

/**
 * The four figures over the Đối soát lines already in scope. The Hoá đơn +
 * Hoá đơn nhà cung cấp + Chi phí join itself happened earlier, in
 * `buildReconciliationItems` (ADR-0012) — this function only sums the
 * resulting lines, it never reads those Mocks itself.
 */
export function getReconciliationStats(items: ReconciliationItem[]) {
  let totalIncomeAmount = 0;
  let totalExpenseAmount = 0;
  for (const item of items) {
    totalIncomeAmount += item.incomeAmount;
    totalExpenseAmount += item.expenseAmount;
  }
  const netProfitAmount = totalIncomeAmount - totalExpenseAmount;
  // Percent of income kept, to one decimal; 0 when there is no income.
  const profitMargin =
    totalIncomeAmount > 0
      ? Math.round((netProfitAmount / totalIncomeAmount) * 1000) / 10
      : 0;

  return {
    totalIncomeAmount,
    totalExpenseAmount,
    netProfitAmount,
    profitMargin,
  };
}
