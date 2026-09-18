import { describe, expect, it } from "vitest";

import type { Invoice } from "~/types/invoice";
import { buildInvoiceSummaryStats } from "~/features/invoices/utils/invoice-calculations";

const invoice = (
  status: Invoice["status"],
  amount: number,
  paidAmount = 0,
): Invoice => ({
  id: status,
  contractId: "C001",
  invoiceNumber: "HÓA-001",
  tenant: "A",
  room: "Phòng 101",
  floor: 1,
  amount,
  lineItems: [],
  payments: [],
  paidAmount,
  reminders: [],
  billingMonth: "2026-04",
  month: "04/2026",
  dueDate: "10/04/2026",
  status,
  paymentDate: null,
  lastUpdated: "20/04/2026",
});

describe("buildInvoiceSummaryStats", () => {
  it("sums each status into its own bucket and skips cancelled", () => {
    expect(
      buildInvoiceSummaryStats([
        invoice("PAID", 100),
        invoice("PAID", 200),
        invoice("UNPAID", 30),
        invoice("OVERDUE", 4),
        invoice("PARTIAL", 7),
        invoice("CANCELLED", 1000),
      ]),
    ).toEqual({
      total: 6,
      paidAmount: 300,
      unpaidAmount: 30,
      overdueAmount: 4,
      partialAmount: 7,
    });
  });

  it("counts an OVERDUE invoice's overdueAmount as phần còn lại, not the full amount", () => {
    // An OVERDUE invoice can still carry a partial payment (deriveInvoiceStatus
    // never treats "chưa đủ, past due" as PARTIAL) — the KPI must match "Hôm
    // nay"'s own overdue.amount (~/utils/dashboard-summary), which is already
    // `amount - paidAmount`.
    expect(
      buildInvoiceSummaryStats([invoice("OVERDUE", 100, 40)]).overdueAmount,
    ).toBe(60);
  });
});
