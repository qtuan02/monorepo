import type { Invoice } from "~/types/invoice";

export interface InvoiceSummaryStats {
  total: number;
  paidAmount: number;
  unpaidAmount: number;
  overdueAmount: number;
  partialAmount: number;
}

/**
 * The four KPI tiles over the list (spec #153 §10: Đã thu / Chưa thu / Quá
 * hạn / Thu một phần) — a cancelled Hoá đơn counts toward `total` but sits
 * in no bucket.
 */
export function buildInvoiceSummaryStats(
  invoices: Invoice[],
): InvoiceSummaryStats {
  const stats: InvoiceSummaryStats = {
    total: invoices.length,
    paidAmount: 0,
    unpaidAmount: 0,
    overdueAmount: 0,
    partialAmount: 0,
  };

  for (const invoice of invoices) {
    if (invoice.status === "PAID") stats.paidAmount += invoice.amount;
    else if (invoice.status === "UNPAID") stats.unpaidAmount += invoice.amount;
    else if (invoice.status === "OVERDUE")
      stats.overdueAmount += invoice.amount;
    else if (invoice.status === "PARTIAL")
      stats.partialAmount += invoice.amount;
  }

  return stats;
}
