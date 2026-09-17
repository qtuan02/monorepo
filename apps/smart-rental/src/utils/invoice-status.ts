import dayjs from "@monorepo/dayjs";
import { DATE_FORMAT } from "@monorepo/dayjs/formats";

import type { Invoice, InvoiceStatus } from "~/types/invoice";

/**
 * `PARTIAL`/`PAID`/`OVERDUE` are never persisted (ADR-0012) — they are read
 * off `paidAmount` and `dueDate` fresh every time. `DRAFT` and `CANCELLED`
 * are explicit lifecycle states a landlord action set, so they pass through
 * unchanged.
 */
export function deriveInvoiceStatus(
  invoice: Pick<Invoice, "status" | "amount" | "paidAmount" | "dueDate">,
  today: Date = new Date(),
): InvoiceStatus {
  if (invoice.status === "DRAFT" || invoice.status === "CANCELLED") {
    return invoice.status;
  }
  if (invoice.paidAmount >= invoice.amount) return "PAID";
  // "chưa đủ" (not fully paid) past the due date is OVERDUE even if
  // something was paid — PARTIAL only describes an invoice still on time.
  if (isPastDueDate(invoice.dueDate, today)) return "OVERDUE";
  return invoice.paidAmount > 0 ? "PARTIAL" : "UNPAID";
}

function isPastDueDate(dueDate: string, today: Date): boolean {
  return dayjs(dueDate, DATE_FORMAT)
    .startOf("day")
    .isBefore(dayjs(today).startOf("day"));
}

/** "Quá hạn n ngày" — 0 while the due date has not passed yet. */
export function daysOverdue(dueDate: string, today: Date = new Date()): number {
  const days = dayjs(today)
    .startOf("day")
    .diff(dayjs(dueDate, DATE_FORMAT).startOf("day"), "day");
  return Math.max(0, days);
}
