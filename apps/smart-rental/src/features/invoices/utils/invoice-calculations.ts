import type { BatchInvoiceItem, Invoice } from "~/types/invoice";

export function getUtilitySubtotal(item: BatchInvoiceItem): number {
  return item.electricity + item.water;
}

export function getInvoiceTotal(item: BatchInvoiceItem): number {
  return item.rent + getUtilitySubtotal(item) + item.service;
}

export interface InvoiceSummaryStats {
  total: number;
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  overdueAmount: number;
}

/** The four KPI tiles over the list; a cancelled Hoá đơn counts but sits in no bucket. */
export function buildInvoiceSummaryStats(
  invoices: Invoice[],
): InvoiceSummaryStats {
  const stats: InvoiceSummaryStats = {
    total: invoices.length,
    totalAmount: 0,
    paidAmount: 0,
    pendingAmount: 0,
    overdueAmount: 0,
  };

  for (const invoice of invoices) {
    stats.totalAmount += invoice.amount;
    if (invoice.status === "PAID") stats.paidAmount += invoice.amount;
    else if (invoice.status === "UNPAID" || invoice.status === "PARTIAL")
      stats.pendingAmount += invoice.amount;
    else if (invoice.status === "OVERDUE")
      stats.overdueAmount += invoice.amount;
  }

  return stats;
}
