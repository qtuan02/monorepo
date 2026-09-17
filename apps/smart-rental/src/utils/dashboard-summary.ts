import dayjs from "@monorepo/dayjs";
import { DATE_FORMAT } from "@monorepo/dayjs/formats";

import type { Contract } from "~/types/contract";
import type {
  DueThisMonthSummary,
  ExpiringContractsSummary,
  MonthlyPoint,
  OccupancySummary,
  OverdueSummary,
  TodaySummary,
} from "~/types/dashboard";
import type { Invoice } from "~/types/invoice";
import type { Room } from "~/types/room";
import { deriveContractStatus } from "~/utils/contract-status";
import { daysOverdue, deriveInvoiceStatus } from "~/utils/invoice-status";

function monthLabel(billingMonth: string): string {
  return `Thg ${Number(billingMonth.split("-")[1])}`;
}

/**
 * "Hôm nay"'s three KPIs, the occupancy donut and the six-month revenue bar
 * — every number read off Hoá đơn/Hợp đồng/Phòng at call time (ADR-0012),
 * never a `mockDashboard` literal. The caller scopes the three arrays to a
 * Building before calling this (spec #153 §10 row 4), the same way
 * `~/utils/task-derivation` and every list hook already do.
 */
export function buildTodaySummary(
  sources: { invoices: Invoice[]; contracts: Contract[]; rooms: Room[] },
  today: Date = new Date(),
): TodaySummary {
  const currentMonth = dayjs(today).format("YYYY-MM");
  const revenueByBillingMonth = new Map<string, number>();

  let dueAmount = 0;
  let dueCount = 0;
  let overdueAmount = 0;
  let overdueCount = 0;
  let maxDaysOverdue = 0;

  for (const invoice of sources.invoices) {
    revenueByBillingMonth.set(
      invoice.billingMonth,
      (revenueByBillingMonth.get(invoice.billingMonth) ?? 0) + invoice.amount,
    );

    const outstanding = invoice.amount - invoice.paidAmount;
    if (invoice.billingMonth === currentMonth && outstanding > 0) {
      dueAmount += outstanding;
      dueCount += 1;
    }
    if (deriveInvoiceStatus(invoice, today) === "OVERDUE") {
      overdueAmount += outstanding;
      overdueCount += 1;
      maxDaysOverdue = Math.max(
        maxDaysOverdue,
        daysOverdue(invoice.dueDate, today),
      );
    }
  }

  const revenueByMonth: MonthlyPoint[] = [...revenueByBillingMonth.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([billingMonth, value]) => ({
      month: monthLabel(billingMonth),
      value: Math.round(value / 1_000_000),
    }));

  let expiringCount = 0;
  let nearestEndDate: string | undefined;
  let nearestRoom: string | undefined;
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
      nearestRoom = contract.room;
    }
  }

  const dueThisMonth: DueThisMonthSummary = {
    amount: dueAmount,
    count: dueCount,
  };
  const overdue: OverdueSummary = {
    amount: overdueAmount,
    count: overdueCount,
    maxDaysOverdue,
  };
  const expiringContracts: ExpiringContractsSummary = {
    count: expiringCount,
    nearestEndDate,
    nearestRoom,
  };

  const vacantRooms = sources.rooms.filter(
    (room) => room.status === "available",
  );
  const occupancy: OccupancySummary = {
    occupied: sources.rooms.filter((room) => room.status === "occupied").length,
    vacant: vacantRooms.length,
    vacantRoomNames: vacantRooms.map((room) => room.name),
  };

  return {
    dueThisMonth,
    overdue,
    expiringContracts,
    occupancy,
    revenueByMonth,
  };
}
