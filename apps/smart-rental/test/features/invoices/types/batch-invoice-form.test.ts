import { describe, expect, it } from "vitest";

import { batchInvoiceFormSchema } from "~/features/invoices/types/batch-invoice-form";

describe("batchInvoiceFormSchema", () => {
  it("accepts a month and at least one selected Hợp đồng", () => {
    expect(
      batchInvoiceFormSchema.safeParse({
        month: "2026-04",
        selectedContractIds: ["C001"],
      }).success,
    ).toBe(true);
  });

  it("refuses an empty selection, by name", () => {
    const result = batchInvoiceFormSchema.safeParse({
      month: "2026-04",
      selectedContractIds: [],
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe(
      "Vui lòng chọn ít nhất một phòng",
    );
  });

  it("wants the month as YYYY-MM, what MonthField yields", () => {
    expect(
      batchInvoiceFormSchema.safeParse({
        month: "04/2026",
        selectedContractIds: ["C001"],
      }).success,
    ).toBe(false);
    expect(
      batchInvoiceFormSchema.safeParse({
        month: "",
        selectedContractIds: ["C001"],
      }).error?.issues[0]?.message,
    ).toBe("Vui lòng chọn kỳ hoá đơn");
  });
});
