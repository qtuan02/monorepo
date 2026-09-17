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
  invoiceNumber: "HÓA-001",
  tenant: "A",
  room: "Phòng 101",
  floor: 1,
  amount,
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
        invoice("paid", 100),
        invoice("paid", 200),
        invoice("pending", 30),
        invoice("overdue", 4),
        invoice("cancelled", 1000),
      ]),
    ).toEqual({
      total: 5,
      totalAmount: 1334,
      paidAmount: 300,
      pendingAmount: 30,
      overdueAmount: 4,
    });
  });
});
