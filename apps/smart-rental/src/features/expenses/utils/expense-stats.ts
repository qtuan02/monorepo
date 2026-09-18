import type { Expense } from "~/types/expense";

/** The three KPI figures over the Chi phí in scope; the average is a whole đồng. */
export function getExpenseStats(expenses: Expense[]) {
  let totalAmount = 0;
  for (const expense of expenses) totalAmount += expense.amount;
  const totalCount = expenses.length;

  return {
    totalAmount,
    totalCount,
    averageAmount: totalCount === 0 ? 0 : Math.round(totalAmount / totalCount),
  };
}
