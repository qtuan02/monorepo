import type { Invoice } from "~/types/invoice";
import type { CsvColumn } from "~/utils/csv";
import { invoiceStatusConfig } from "~/constants/status";
import { toCsv } from "~/utils/csv";
import { formatDate, formatMonth } from "~/utils/date";

interface InvoiceCsvRow {
  invoiceNumber: string;
  tenant: string;
  room: string;
  month: string;
  amount: number;
  paidAmount: number;
  remaining: number;
  dueDate: string;
  status: string;
}

const INVOICE_CSV_COLUMNS: CsvColumn<InvoiceCsvRow>[] = [
  { key: "invoiceNumber", header: "Số hoá đơn" },
  { key: "tenant", header: "Người thuê" },
  { key: "room", header: "Phòng" },
  { key: "month", header: "Kỳ" },
  { key: "amount", header: "Tổng tiền" },
  { key: "paidAmount", header: "Đã trả" },
  { key: "remaining", header: "Còn lại" },
  { key: "dueDate", header: "Hạn thu" },
  { key: "status", header: "Trạng thái" },
];

/** "Xuất CSV các hàng đang lọc" (spec #153 §10 row 12) — the rows on screen, as-is. */
export function buildInvoiceCsv(invoices: Invoice[]): string {
  const rows: InvoiceCsvRow[] = invoices.map((invoice) => ({
    invoiceNumber: invoice.invoiceNumber,
    tenant: invoice.tenant,
    room: invoice.room,
    month: formatMonth(invoice.billingMonth),
    amount: invoice.amount,
    paidAmount: invoice.paidAmount,
    remaining: invoice.amount - invoice.paidAmount,
    dueDate: formatDate(invoice.dueDate),
    status: invoiceStatusConfig[invoice.status].label,
  }));
  return toCsv(rows, INVOICE_CSV_COLUMNS);
}
