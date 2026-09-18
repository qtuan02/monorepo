import dayjs from "@monorepo/dayjs";
import { DATE_FORMAT } from "@monorepo/dayjs/formats";

import type { Contract } from "~/types/contract";
import type {
  ExpiringContractsSummary,
  MonthSummary,
  OutstandingThisMonthSummary,
  TodaySummary,
} from "~/types/dashboard";
import type { Invoice } from "~/types/invoice";
import type { Room } from "~/types/room";
import { deriveContractStatus } from "~/utils/contract-status";
import { formatMonth } from "~/utils/date";
import { deriveInvoiceStatus } from "~/utils/invoice-status";

/**
 * "Còn phải thu tháng này" + "Hợp đồng sắp hết hạn" — the two KPIs that read
 * off Hoá đơn/Hợp đồng directly (the third, Chỉ số kỳ, is
 * `~/utils/cycle-progress`'s own, off a different set of sources). The
 * caller scopes `invoices`/`contracts` to a Building before calling this,
 * the same way `~/utils/task-derivation` does (spec #179 §"Hôm nay").
 *
 * "Tháng này" reads by hạn thu, not by kỳ — Kỳ 09 has no Hoá đơn yet at
 * "hôm nay" (ADR-0013), so a Hoá đơn lập ở Kỳ 08 with hạn thu in September
 * IS what "tháng này" means, never `invoice.billingMonth === currentMonth`.
 */
export function buildTodaySummary(
  sources: { invoices: Invoice[]; contracts: Contract[] },
  today: Date = new Date(),
): Pick<TodaySummary, "outstandingThisMonth" | "expiringContracts"> {
  const currentMonth = dayjs(today).format("YYYY-MM");

  let outstandingAmount = 0;
  let overdueCount = 0;
  for (const invoice of sources.invoices) {
    const dueMonth = dayjs(invoice.dueDate, DATE_FORMAT).format("YYYY-MM");
    if (dueMonth !== currentMonth) continue;
    const outstanding = invoice.amount - invoice.paidAmount;
    if (outstanding <= 0) continue;
    outstandingAmount += outstanding;
    if (deriveInvoiceStatus(invoice, today) === "OVERDUE") overdueCount += 1;
  }

  let expiringCount = 0;
  let nearestEndDate: string | undefined;
  let nearestDiff = Number.POSITIVE_INFINITY;
  for (const contract of sources.contracts) {
    if (deriveContractStatus(contract, today) !== "EXPIRING") continue;
    expiringCount += 1;
    const diff = dayjs(contract.endDate, DATE_FORMAT)
      .startOf("day")
      .diff(dayjs(today).startOf("day"), "day");
    if (diff < nearestDiff) {
      nearestDiff = diff;
      nearestEndDate = contract.endDate;
    }
  }

  const outstandingThisMonth: OutstandingThisMonthSummary = {
    amount: outstandingAmount,
    overdueCount,
  };
  const expiringContracts: ExpiringContractsSummary = {
    count: expiringCount,
    nearestEndDate,
  };

  return { outstandingThisMonth, expiringContracts };
}

/**
 * "Tháng này" card — lấp đầy, đã lập, đã thu, còn phải thu, cùng nguồn Hoá
 * đơn `buildTodaySummary` reads (hạn thu trong tháng), cộng Phòng cho lấp đầy.
 */
export function buildMonthSummary(
  sources: { invoices: Invoice[]; rooms: Room[] },
  today: Date = new Date(),
): MonthSummary {
  const currentMonth = dayjs(today).format("YYYY-MM");

  let invoicedAmount = 0;
  let collectedAmount = 0;
  for (const invoice of sources.invoices) {
    const dueMonth = dayjs(invoice.dueDate, DATE_FORMAT).format("YYYY-MM");
    if (dueMonth !== currentMonth) continue;
    invoicedAmount += invoice.amount;
    collectedAmount += invoice.paidAmount;
  }

  return {
    month: formatMonth(currentMonth),
    occupiedRooms: sources.rooms.filter((room) => room.status === "occupied")
      .length,
    totalRooms: sources.rooms.length,
    invoicedAmount,
    collectedAmount,
    outstandingAmount: invoicedAmount - collectedAmount,
  };
}
