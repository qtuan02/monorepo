import type { PriceList } from "~/types/building";
import type { MeterEntryStatus, Utility, UtilityType } from "~/types/utility";
import {
  findAnomalousUtilities,
  isUtilityAnomalous,
} from "~/utils/utility-anomaly";

export interface MeterReading {
  /** New − old; `null` while the field is empty or not a number. */
  consumption: number | null;
  /** `null` while empty; `anomaly` when it regressed or is > 2× kỳ trước. */
  status: MeterEntryStatus | null;
}

/**
 * What one cell of "Nhập chỉ số" says about a typed value — the ratio check
 * is the same pure `isUtilityAnomalous` a persisted Chỉ số is judged by
 * (ADR-0012), so the live badge and the derived one never disagree.
 */
export function readMeter(
  oldIndex: number,
  input: string,
  previousConsumption = 0,
): MeterReading {
  if (input.trim() === "") return { consumption: null, status: null };
  const newIndex = Number(input);
  if (!Number.isFinite(newIndex))
    return { consumption: null, status: "anomaly" };
  const consumption = newIndex - oldIndex;
  const anomalous = isUtilityAnomalous(
    { oldIndex, newIndex, consumption },
    { consumption: previousConsumption },
  );
  return { consumption, status: anomalous ? "anomaly" : "draft" };
}

/** A row's badge over its two readings: an anomaly wins, a draft beats untouched. */
export function combineMeterStatus(
  ...statuses: (MeterEntryStatus | null)[]
): MeterEntryStatus | null {
  if (statuses.includes("anomaly")) return "anomaly";
  if (statuses.includes("draft")) return "draft";
  return null;
}

export const utilityUnit: Record<UtilityType, string> = {
  electricity: "kWh",
  water: "m³",
};

/** The Toà nhà's own Bảng giá — never a flat, hard-coded rate (spec #153 §10 row 6). */
export function estimateUtilityCost(
  type: UtilityType,
  consumption: number,
  priceList: PriceList,
): number {
  const rate =
    type === "electricity"
      ? priceList.electricityPricePerKwh
      : priceList.waterPricePerM3;
  return consumption * rate;
}

export interface UtilityStats {
  /** The most recent kỳ present in the scoped Mock; `null` when it has none. */
  month: string | null;
  finalizedCount: number;
  draftCount: number;
  anomalyCount: number;
}

/**
 * KPI over one kỳ — the latest month present in the (Building-scoped) list,
 * never a running total across every kỳ ever entered. `anomalyCount` still
 * runs `findAnomalousUtilities` over the FULL list first, so a kỳ-09 record
 * is compared against kỳ 08 before being filtered down to kỳ 09's own count.
 */
export function calculateUtilityStats(utilities: Utility[]): UtilityStats {
  const month = utilities.reduce<string | null>(
    (latest, utility) =>
      !latest || utility.month > latest ? utility.month : latest,
    null,
  );
  const periodUtilities = utilities.filter((u) => u.month === month);
  const anomalousThisPeriod = findAnomalousUtilities(utilities).filter(
    (u) => u.month === month,
  );

  return {
    month,
    finalizedCount: periodUtilities.filter((u) => u.status === "FINALIZED")
      .length,
    draftCount: periodUtilities.filter((u) => u.status === "DRAFT").length,
    anomalyCount: anomalousThisPeriod.length,
  };
}
