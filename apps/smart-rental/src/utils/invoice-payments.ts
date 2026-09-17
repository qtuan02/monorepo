import type { InvoicePayment } from "~/types/invoice";

/** A Hoá đơn's `paidAmount` — derived from its `payments`, never stored on its own. */
export function sumInvoicePayments(payments: InvoicePayment[]): number {
  return payments.reduce((total, payment) => total + payment.amount, 0);
}
