import type { Building } from "~/types/building";
import type { Contract } from "~/types/contract";
import type { CycleProgressSummary } from "~/types/dashboard";
import type { Invoice } from "~/types/invoice";
import type { Room } from "~/types/room";
import type { Utility } from "~/types/utility";
import { buildCycleRows, isCycleClosingDatePassed } from "~/utils/cycle-rows";
import { formatMonth } from "~/utils/date";

/**
 * Hôm nay's third KPI ("Chỉ số kỳ MM/YYYY x/y phòng", spec #179 §"Hôm nay") —
 * off the SAME `buildCycleRows` the màn Kỳ table reads (ADR-0013), so the
 * two screens can never disagree on how many Phòng còn thiếu chỉ số. A `null`
 * Building scope sums every Toà nhà's own rows; a scope of one just reads it.
 */
export function buildCycleProgressSummary(
  buildings: Pick<Building, "id" | "priceList">[],
  month: string,
  rooms: Room[],
  contracts: Contract[],
  utilities: Utility[],
  invoices: Pick<Invoice, "contractId" | "billingMonth">[],
  today: Date = new Date(),
): CycleProgressSummary {
  let entered = 0;
  let total = 0;
  let anomalyCount = 0;
  let invoicedCount = 0;

  for (const building of buildings) {
    const rows = buildCycleRows(
      building.id,
      month,
      rooms,
      contracts,
      utilities,
      invoices,
      building.priceList,
      today,
    );
    for (const row of rows) {
      if (row.status === "EMPTY") continue;
      total += 1;
      if (row.status !== "MISSING") entered += 1;
      if (row.status === "ANOMALY") anomalyCount += 1;
      if (row.status === "INVOICED") invoicedCount += 1;
    }
  }

  return {
    month,
    entered,
    total,
    anomalyCount,
    allInvoiced: total > 0 && invoicedCount === total,
  };
}

export interface NextCycleAction {
  label: string;
  /** `YYYY-MM` — the caller builds the link with `ROUTES.cycleDetailPath`. */
  month: string;
}

/**
 * Hôm nay's header button (spec #179 §"Hôm nay" decision 21): "việc kế tiếp
 * của tháng" — Nhập chỉ số while something is still missing, Lập Đợt once
 * the ngày chốt has passed and something is still un-lập, `null` once there
 * is nothing left to do (or nothing to report at all — 0 Phòng đang thuê).
 */
export function resolveNextCycleAction(
  progress: CycleProgressSummary,
  today: Date = new Date(),
): NextCycleAction | null {
  if (progress.total === 0) return null;
  if (progress.entered < progress.total) {
    return {
      label: `Nhập chỉ số Kỳ ${formatMonth(progress.month)}`,
      month: progress.month,
    };
  }
  if (
    !progress.allInvoiced &&
    isCycleClosingDatePassed(progress.month, today)
  ) {
    return { label: "Lập Đợt hoá đơn", month: progress.month };
  }
  return null;
}
