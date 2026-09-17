import type { OccupancyBucket, ReportRow } from "~/types/report";

/** The "no filter" value of each Select — a Select needs a string per item. */
export const ALL = "all";

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

/** The band a rate falls in — the thresholds are documented on `OccupancyBucket`. */
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
