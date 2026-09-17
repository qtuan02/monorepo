import type { ReportRow } from "~/types/report";

/** The "no filter" value of each Select — a Select needs a string per item. */
export const ALL = "all";

export type OccupancyBucket = "good" | "warning" | "critical";

export interface ReportFilters {
  building: string;
  floor: string;
  status: OccupancyBucket | typeof ALL;
}

export const defaultReportFilters: ReportFilters = {
  building: ALL,
  floor: ALL,
  status: ALL,
};

export const occupancyBucketConfig: Record<
  OccupancyBucket,
  { label: string; className: string }
> = {
  good: { label: "Tốt", className: "bg-emerald-100 text-emerald-800" },
  warning: { label: "Cảnh báo", className: "bg-amber-100 text-amber-800" },
  critical: { label: "Nguy hiểm", className: "bg-red-100 text-red-800" },
};

/** The prototype's thresholds: ≥ 90 good, ≥ 70 warning, else critical. */
export function occupancyBucket(occupancyRate: number): OccupancyBucket {
  if (occupancyRate >= 90) return "good";
  if (occupancyRate >= 70) return "warning";
  return "critical";
}

export function filterReportRows(
  rows: ReportRow[],
  filters: ReportFilters,
): ReportRow[] {
  return rows.filter(
    (row) =>
      (filters.building === ALL || row.building === filters.building) &&
      (filters.floor === ALL || row.floor === filters.floor) &&
      (filters.status === ALL ||
        occupancyBucket(row.occupancyRate) === filters.status),
  );
}
