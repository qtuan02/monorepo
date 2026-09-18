import { describe, expect, it } from "vitest";

import {
  computeContractDebt,
  computeDepositSettlement,
} from "~/utils/contract-liquidation";

describe("computeContractDebt", () => {
  it("sums only invoices still owing money", () => {
    expect(
      computeContractDebt([
        { status: "OVERDUE", amount: 2_500_000, paidAmount: 0 },
        { status: "PARTIAL", amount: 1_000_000, paidAmount: 400_000 },
        { status: "PAID", amount: 1_200_000, paidAmount: 1_200_000 },
        { status: "CANCELLED", amount: 900_000, paidAmount: 0 },
        { status: "DRAFT", amount: 500_000, paidAmount: 0 },
      ]),
    ).toBe(2_500_000 + (1_000_000 - 400_000));
  });

  it("is zero with no invoices", () => {
    expect(computeContractDebt([])).toBe(0);
  });
});

describe("computeDepositSettlement", () => {
  it("hands back nothing on FORFEITED, whatever the debt", () => {
    expect(
      computeDepositSettlement({
        depositAmount: 9_000_000,
        outstandingDebt: 2_500_000,
        decision: "FORFEITED",
      }),
    ).toEqual({ availableAfterDebt: 6_500_000, returnedAmount: 0 });
  });

  it("hands back everything left after debt on RETURNED", () => {
    expect(
      computeDepositSettlement({
        depositAmount: 9_000_000,
        outstandingDebt: 2_500_000,
        decision: "RETURNED",
      }),
    ).toEqual({ availableAfterDebt: 6_500_000, returnedAmount: 6_500_000 });
  });

  // The ticket's own scenario (#162 AC): cọc 9tr, 1 Hoá đơn còn nợ 2,5tr,
  // "hoàn một phần" — the default figure is what's left after the debt.
  it("defaults PARTIAL_RETURNED to the amount left after debt", () => {
    expect(
      computeDepositSettlement({
        depositAmount: 9_000_000,
        outstandingDebt: 2_500_000,
        decision: "PARTIAL_RETURNED",
      }),
    ).toEqual({ availableAfterDebt: 6_500_000, returnedAmount: 6_500_000 });
  });

  it("clamps a landlord-chosen PARTIAL_RETURNED figure into [0, availableAfterDebt]", () => {
    const base = {
      depositAmount: 9_000_000,
      outstandingDebt: 2_500_000,
      decision: "PARTIAL_RETURNED" as const,
    };
    expect(
      computeDepositSettlement({ ...base, partialReturnAmount: 4_000_000 }),
    ).toEqual({ availableAfterDebt: 6_500_000, returnedAmount: 4_000_000 });
    expect(
      computeDepositSettlement({ ...base, partialReturnAmount: 99_000_000 }),
    ).toEqual({ availableAfterDebt: 6_500_000, returnedAmount: 6_500_000 });
    expect(
      computeDepositSettlement({ ...base, partialReturnAmount: -1 }),
    ).toEqual({ availableAfterDebt: 6_500_000, returnedAmount: 0 });
  });

  it("never lets debt push availableAfterDebt below zero", () => {
    expect(
      computeDepositSettlement({
        depositAmount: 2_000_000,
        outstandingDebt: 5_000_000,
        decision: "RETURNED",
      }),
    ).toEqual({ availableAfterDebt: 0, returnedAmount: 0 });
  });
});
