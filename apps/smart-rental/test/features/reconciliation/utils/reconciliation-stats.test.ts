import { describe, expect, it } from "vitest";

import type { ReconciliationItem } from "~/types/reconciliation";
import { getReconciliationStats } from "~/features/reconciliation/utils/reconciliation-stats";

function line(incomeAmount: number, expenseAmount: number): ReconciliationItem {
  return {
    id: `r-${incomeAmount}`,
    buildingId: "b1",
    lineItemName: "x",
    incomeAmount,
    expenseAmount,
    netAmount: incomeAmount - expenseAmount,
    status: incomeAmount >= expenseAmount ? "gain" : "loss",
  };
}

describe("getReconciliationStats", () => {
  it("sums income and expense, nets them, and keeps the margin to one decimal", () => {
    expect(
      getReconciliationStats([
        line(18_500_000, 15_200_000),
        line(750_000, 880_000),
      ]),
    ).toEqual({
      totalIncomeAmount: 19_250_000,
      totalExpenseAmount: 16_080_000,
      netProfitAmount: 3_170_000,
      profitMargin: 16.5,
    });
  });

  it("reports a loss as a negative net and a negative margin", () => {
    expect(getReconciliationStats([line(1_000_000, 1_250_000)])).toMatchObject({
      netProfitAmount: -250_000,
      profitMargin: -25,
    });
  });

  it("is all zeros with no lines — no division by zero on the margin", () => {
    expect(getReconciliationStats([])).toEqual({
      totalIncomeAmount: 0,
      totalExpenseAmount: 0,
      netProfitAmount: 0,
      profitMargin: 0,
    });
  });
});
