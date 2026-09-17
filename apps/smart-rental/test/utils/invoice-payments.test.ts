import { describe, expect, it } from "vitest";

import type { InvoicePayment } from "~/types/invoice";
import { sumInvoicePayments } from "~/utils/invoice-payments";

describe("sumInvoicePayments", () => {
  it("is 0 for an invoice with no payments yet", () => {
    expect(sumInvoicePayments([])).toBe(0);
  });

  it("sums every payment, regardless of method", () => {
    const payments: InvoicePayment[] = [
      { amount: 1_500_000, method: "CASH", paidAt: "2026-09-01" },
      { amount: 1_000_000, method: "VIETQR", paidAt: "2026-09-10" },
    ];

    expect(sumInvoicePayments(payments)).toBe(2_500_000);
  });
});
