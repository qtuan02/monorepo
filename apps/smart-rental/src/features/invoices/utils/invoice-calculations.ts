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
 * in no bucket. `overdueAmount` is the phần còn lại (`amount - paidAmount`),
 * not the full invoice amount — an OVERDUE invoice can carry a partial
 * payment too, and "Hôm nay"'s own Quá hạn KPI (`~/utils/dashboard-summary`)
 * already reads it this way; the two must report the same number.
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
      stats.overdueAmount += invoice.amount - invoice.paidAmount;
    else if (invoice.status === "PARTIAL")
      stats.partialAmount += invoice.amount;
  }

  return stats;
}
