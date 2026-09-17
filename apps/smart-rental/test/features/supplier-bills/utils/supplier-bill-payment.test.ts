import { describe, expect, it } from "vitest";

import type { SupplierBill } from "~/types/supplier-bill";
import { getSupplierBillTotals } from "~/features/supplier-bills/utils/supplier-bill-payment";

function bill(totalAmount: number, paymentDate?: string): SupplierBill {
  return {
    id: `sb-${totalAmount}`,
    buildingId: "b1",
    buildingName: "x",
    type: "electricity",
    supplierName: "EVN",
    billingPeriod: "2024-03",
    totalAmount,
    paymentDate,
  };
}

describe("getSupplierBillTotals", () => {
  it("counts every bill into the total but only unpaid ones into pending", () => {
    expect(
      getSupplierBillTotals([
        bill(12_500_000, "2024-04-05"),
        bill(13_200_000),
        bill(350_000),
      ]),
    ).toEqual({ totalAmount: 26_050_000, pendingAmount: 13_550_000, count: 3 });
  });
});
