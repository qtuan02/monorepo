import type { ReconciliationItem } from "~/types/reconciliation";

/**
 * The four figures over the Đối soát lines in scope. Computed from the lines
 * on screen rather than from Hoá đơn and Hoá đơn nhà cung cấp, exactly as the
 * prototype did (spec #127) — the backend will own the real join.
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
