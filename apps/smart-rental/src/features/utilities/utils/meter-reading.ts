import type { MeterEntryStatus, Utility, UtilityType } from "~/types/utility";
import { findAnomalousUtilities } from "~/utils/utility-anomaly";

export interface MeterReading {
  /** New − old; `null` while the field is empty or not a number. */
  consumption: number | null;
  /** `null` while empty; `anomaly` when the reading went backwards or is not a number. */
  status: MeterEntryStatus | null;
}

/**
 * What one cell of "Nhập chỉ số" says about a typed value. The prototype
 * showed "Chưa nhập" on every row; the derived draft/anomaly is the one piece
 * of logic this screen has, so it lives here where a test can reach it.
 */
export function readMeter(oldIndex: number, input: string): MeterReading {
  if (input.trim() === "") return { consumption: null, status: null };
  const newIndex = Number(input);
  if (!Number.isFinite(newIndex))
    return { consumption: null, status: "anomaly" };
  const consumption = newIndex - oldIndex;
  return { consumption, status: consumption < 0 ? "anomaly" : "draft" };
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

/** The prototype's flat preview rates; the EVN tiers live in Cài đặt (a later ticket). */
export const utilityRate: Record<UtilityType, number> = {
  electricity: 3500,
  water: 8000,
};

export function estimateUtilityCost(
  type: UtilityType,
  consumption: number,
): number {
  return consumption * utilityRate[type];
}

export interface UtilityStats {
  totalReadings: number;
  anomalyCount: number;
  pendingVerifyCount: number;
}

/** `anomalyCount` is `findAnomalousUtilities` (ADR-0012) — never a stored count. */
export function calculateUtilityStats(utilities: Utility[]): UtilityStats {
  return {
    totalReadings: utilities.length,
    anomalyCount: findAnomalousUtilities(utilities).length,
    pendingVerifyCount: utilities.filter((u) => u.status === "DRAFT").length,
  };
}
