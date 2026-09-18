import { describe, expect, it } from "vitest";

import { buildReconciliationItems } from "~/utils/reconciliation-items";

const invoices = [
  {
    buildingId: "b1",
    billingMonth: "2026-09",
    lineItems: [
      {
        type: "ELECTRIC" as const,
        description: "",
        quantity: 1,
        unitPrice: 0,
        amount: 300_000,
      },
    ],
  },
  {
    buildingId: "b1",
    billingMonth: "2026-08",
    lineItems: [
      {
        type: "ELECTRIC" as const,
        description: "",
        quantity: 1,
        unitPrice: 0,
        amount: 999_999,
      },
    ],
  },
  {
    buildingId: "b2",
    billingMonth: "2026-09",
    lineItems: [
      {
        type: "ELECTRIC" as const,
        description: "",
        quantity: 1,
        unitPrice: 0,
        amount: 500_000,
      },
    ],
  },
];

const supplierBills = [
  {
    buildingId: "b1",
    type: "electricity" as const,
    totalAmount: 200_000,
    billingPeriod: "2026-09",
  },
  {
    buildingId: "b2",
    type: "electricity" as const,
    totalAmount: 100_000,
    billingPeriod: "2026-09",
  },
];

const expenses = [
  { buildingId: "b1", amount: 50_000, expenseDate: "2026-09-12" },
  { buildingId: "b1", amount: 777_777, expenseDate: "2026-08-01" },
];

describe("buildReconciliationItems", () => {
  it("scopes to one Toà nhà and one kỳ", () => {
    const items = buildReconciliationItems(
      invoices,
      supplierBills,
      expenses,
      "b1",
      "2026-09",
    );
    const electric = items.find((item) => item.lineItemName === "Tiền điện");

    expect(electric).toMatchObject({
      incomeAmount: 300_000,
      expenseAmount: 200_000,
    });
  });

  it("leaves out a kỳ that was not asked for", () => {
    const items = buildReconciliationItems(
      invoices,
      supplierBills,
      expenses,
      "b1",
      "2026-09",
    );

    // The 08/2026 invoice (999,999) and Chi phí (777,777) never leak in.
    const electric = items.find((item) => item.lineItemName === "Tiền điện");
    expect(electric?.incomeAmount).toBe(300_000);
    const service = items.find((item) => item.lineItemName === "Phí dịch vụ");
    expect(service?.expenseAmount).toBe(50_000);
  });

  it("never mixes another Toà nhà's lines into this one's block", () => {
    const items = buildReconciliationItems(
      invoices,
      supplierBills,
      expenses,
      "b1",
      "2026-09",
    );
    const electric = items.find((item) => item.lineItemName === "Tiền điện");

    // b2's 500,000/100,000 stay out — a caller building "mỗi Toà nhà một
    // khối" calls this once per Toà nhà rather than getting one merged total.
    expect(electric).toMatchObject({
      incomeAmount: 300_000,
      expenseAmount: 200_000,
    });
  });

  it("folds Chi phí with no service type into Phí dịch vụ", () => {
    const items = buildReconciliationItems(
      invoices,
      supplierBills,
      expenses,
      "b1",
      "2026-09",
    );
    const service = items.find((item) => item.lineItemName === "Phí dịch vụ");

    expect(service).toMatchObject({ expenseAmount: 50_000, status: "loss" });
  });

  it("leaves out a line with neither income nor expense", () => {
    const items = buildReconciliationItems(
      invoices,
      supplierBills,
      expenses,
      "b1",
      "2026-09",
    );

    expect(items.some((item) => item.lineItemName === "Tiền phòng")).toBe(
      false,
    );
  });
});
