import dayjs from "@monorepo/dayjs";

import type {
  ExpiringContractsSummary,
  MonthSummary,
  OutstandingThisMonthSummary,
  TodaySummary,
} from "~/types/dashboard";
import type { World } from "~/types/world";
import { formatMonth } from "~/utils/date";

/**
 * "Còn phải thu tháng này" + "Hợp đồng sắp hết hạn" — the two KPIs that read
 * off Hoá đơn/Hợp đồng directly (the third, Chỉ số kỳ, is
 * `~/utils/cycle-progress`'s own, off a different set of sources). `world`
 * already carries `invoices`/`contracts` scoped to the Building and đã suy
 * `status`, the same World `~/utils/task-derivation` reads (ADR-0015).
 *
 * "Tháng này" reads by hạn thu, not by kỳ — Kỳ 09 has no Hoá đơn yet at
 * "hôm nay" (ADR-0013), so a Hoá đơn lập ở Kỳ 08 with hạn thu in September
 * IS what "tháng này" means, never `invoice.billingMonth === currentMonth`.
 */
export function buildTodaySummary(
  world: World,
): Pick<TodaySummary, "outstandingThisMonth" | "expiringContracts"> {
  const { today } = world;
  const currentMonth = dayjs(today).format("YYYY-MM");

  let outstandingAmount = 0;
  let overdueCount = 0;
  for (const invoice of world.invoices) {
    const dueMonth = dayjs(invoice.dueDate).format("YYYY-MM");
    if (dueMonth !== currentMonth) continue;
    const outstanding = invoice.amount - invoice.paidAmount;
    if (outstanding <= 0) continue;
    outstandingAmount += outstanding;
    if (invoice.status === "OVERDUE") overdueCount += 1;
  }

  let expiringCount = 0;
  let nearestEndDate: string | undefined;
  let nearestDiff = Number.POSITIVE_INFINITY;
  for (const contract of world.contracts) {
    if (contract.status !== "EXPIRING") continue;
    expiringCount += 1;
    const diff = dayjs(contract.endDate)
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
export function buildMonthSummary(world: World): MonthSummary {
  const currentMonth = dayjs(world.today).format("YYYY-MM");

  let invoicedAmount = 0;
  let collectedAmount = 0;
  for (const invoice of world.invoices) {
    const dueMonth = dayjs(invoice.dueDate).format("YYYY-MM");
    if (dueMonth !== currentMonth) continue;
    invoicedAmount += invoice.amount;
    collectedAmount += invoice.paidAmount;
  }

  return {
    month: formatMonth(currentMonth),
    occupiedRooms: world.rooms.filter((room) => room.status === "occupied")
      .length,
    totalRooms: world.rooms.length,
    invoicedAmount,
    collectedAmount,
    outstandingAmount: invoicedAmount - collectedAmount,
  };
}
