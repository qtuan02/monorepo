import { describe, expect, it } from "vitest";

import type { Expense } from "~/types/expense";
import { getExpenseStats } from "~/features/expenses/utils/expense-stats";

function expense(amount: number): Expense {
  return {
    id: `e-${amount}`,
    buildingId: "b1",
    buildingName: "x",
    category: "Bảo trì",
    amount,
    expenseDate: "2024-04-10",
  };
}

describe("getExpenseStats", () => {
  it("totals, counts, and rounds the average to a whole đồng", () => {
    expect(getExpenseStats([expense(1_000_000), expense(500_001)])).toEqual({
      totalAmount: 1_500_001,
      totalCount: 2,
      averageAmount: 750_001,
    });
  });

  it("averages to 0 with no expenses rather than NaN", () => {
    expect(getExpenseStats([])).toEqual({
      totalAmount: 0,
      totalCount: 0,
      averageAmount: 0,
    });
  });
});
