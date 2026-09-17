import { describe, expect, it } from "vitest";

import { batchInvoiceFormSchema } from "~/features/invoices/types/batch-invoice-form";

describe("batchInvoiceFormSchema", () => {
  it("accepts a month and at least one selected Hoá đơn", () => {
    expect(
      batchInvoiceFormSchema.safeParse({
        month: "2026-04",
        selectedInvoiceIds: ["1"],
      }).success,
    ).toBe(true);
  });

  it("refuses an empty selection, by name", () => {
    const result = batchInvoiceFormSchema.safeParse({
      month: "2026-04",
      selectedInvoiceIds: [],
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe(
      "Vui lòng chọn ít nhất một hóa đơn",
    );
  });

  it("wants the month as YYYY-MM, what <input type=month> yields", () => {
    expect(
      batchInvoiceFormSchema.safeParse({
        month: "04/2026",
        selectedInvoiceIds: ["1"],
      }).success,
    ).toBe(false);
    expect(
      batchInvoiceFormSchema.safeParse({ month: "", selectedInvoiceIds: ["1"] })
        .error?.issues[0]?.message,
    ).toBe("Vui lòng chọn kỳ hóa đơn");
  });
});
