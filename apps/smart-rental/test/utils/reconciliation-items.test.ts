import { describe, expect, it } from "vitest";

import { buildReconciliationItems } from "~/utils/reconciliation-items";

const invoices = [
  {
    buildingId: "b1",
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
    buildingId: "b2",
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
  { buildingId: "b1", type: "electricity" as const, totalAmount: 200_000 },
  { buildingId: "b2", type: "electricity" as const, totalAmount: 100_000 },
];

const expenses = [{ buildingId: "b1", amount: 50_000 }];

describe("buildReconciliationItems", () => {
  it("scopes to one Toà nhà when buildingId is given", () => {
    const items = buildReconciliationItems(
      invoices,
      supplierBills,
      expenses,
      "b1",
    );
    const electric = items.find((item) => item.lineItemName === "Tiền điện");

    expect(electric).toMatchObject({
      incomeAmount: 300_000,
      expenseAmount: 200_000,
    });
  });

  it("aggregates every Toà nhà when buildingId is null", () => {
    const items = buildReconciliationItems(
      invoices,
      supplierBills,
      expenses,
      null,
    );
    const electric = items.find((item) => item.lineItemName === "Tiền điện");

    expect(electric).toMatchObject({
      incomeAmount: 800_000,
      expenseAmount: 300_000,
    });
  });

  it("folds Chi phí with no service type into Phí dịch vụ", () => {
    const items = buildReconciliationItems(
      invoices,
      supplierBills,
      expenses,
      "b1",
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
    );

    expect(items.some((item) => item.lineItemName === "Tiền phòng")).toBe(
      false,
    );
  });
});
