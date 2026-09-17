import { describe, expect, it } from "vitest";

import type { BatchInvoiceItem, Invoice } from "~/types/invoice";
import {
  buildInvoiceSummaryStats,
  getInvoiceTotal,
  getUtilitySubtotal,
} from "~/features/invoices/utils/invoice-calculations";

const item: BatchInvoiceItem = {
  id: "1",
  room: "101",
  tenant: "Nguyễn Văn A",
  rent: 3000000,
  electricity: 350000,
  water: 60000,
  service: 100000,
};

const invoice = (status: Invoice["status"], amount: number): Invoice => ({
  id: status,
  contractId: "C001",
  invoiceNumber: "HÓA-001",
  tenant: "A",
  room: "Phòng 101",
  floor: 1,
  amount,
  lineItems: [],
  payments: [],
  paidAmount: 0,
  billingMonth: "2026-04",
  month: "04/2026",
  dueDate: "10/04/2026",
  status,
  paymentDate: null,
  lastUpdated: "20/04/2026",
});

describe("invoice calculations", () => {
  it("adds điện and nước into the utility subtotal", () => {
    expect(getUtilitySubtotal(item)).toBe(410000);
  });

  it("totals rent, utilities and service", () => {
    expect(getInvoiceTotal(item)).toBe(3510000);
  });

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
      totalAmount: 1341,
      paidAmount: 300,
      unpaidAmount: 30,
      overdueAmount: 4,
      partialAmount: 7,
    });
  });
});
