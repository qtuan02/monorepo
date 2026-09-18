import type { CycleProgressSummary } from "~/types/dashboard";
import type { World } from "~/types/world";
import { buildCycleRows, isCycleClosingDatePassed } from "~/utils/cycle-rows";
import { formatMonth } from "~/utils/date";

/**
 * Hôm nay's third KPI ("Chỉ số kỳ MM/YYYY x/y phòng", spec #179 §"Hôm nay") —
 * off the SAME `buildCycleRows` the màn Kỳ table reads (ADR-0013), so the
 * two screens can never disagree on how many Phòng còn thiếu chỉ số. World's
 * `buildings` already carries a `null` Building scope as every Toà nhà, or
 * one as just itself, so summing across `world.buildings` reads correctly
 * either way. Everything `buildCycleRows` needs (Bảng giá, `today`, "Sửa chỉ
 * số cũ" overrides) now travels on `world` itself — nothing left to forget
 * to forward (the bug ticket #206 vá'd by hand).
 */
export function buildCycleProgressSummary(
  world: World,
  month: string,
): CycleProgressSummary {
  let entered = 0;
  let total = 0;
  let anomalyCount = 0;
  let invoicedCount = 0;

  for (const building of world.buildings) {
    const rows = buildCycleRows(world, building.id, month);
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
