import { describe, expect, it } from "vitest";

import type { ReportRow } from "~/types/report";
import {
  ALL,
  filterReportRows,
  occupancyBucket,
} from "~/features/reports/utils/report-filters";

const row = (patch: Partial<ReportRow>): ReportRow => ({
  month: "04/2026",
  building: "A",
  floor: "Tầng 1",
  revenue: 0,
  expenses: 0,
  profit: 0,
  occupancyRate: 100,
  waterUsage: 0,
  electricityUsage: 0,
  overdueTenants: 0,
  totalTenants: 5,
  ...patch,
});

describe("occupancyBucket", () => {
  it("is good from 90, warning from 70, critical below", () => {
    expect(occupancyBucket(90)).toBe("good");
    expect(occupancyBucket(89)).toBe("warning");
    expect(occupancyBucket(70)).toBe("warning");
    expect(occupancyBucket(69)).toBe("critical");
  });
});

describe("filterReportRows", () => {
  const rows = [
    row({ building: "A", floor: "Tầng 1", occupancyRate: 95 }),
    row({ building: "A", floor: "Tầng 2", occupancyRate: 75 }),
    row({ building: "B", floor: "Tầng 1", occupancyRate: 50 }),
  ];

  it("keeps every row when every filter is «all»", () => {
    expect(
      filterReportRows(rows, { building: ALL, floor: ALL, status: ALL }),
    ).toHaveLength(3);
  });

  it("narrows by building, floor and occupancy bucket together", () => {
    expect(
      filterReportRows(rows, { building: "A", floor: ALL, status: ALL }),
    ).toHaveLength(2);
    expect(
      filterReportRows(rows, { building: ALL, floor: "Tầng 1", status: ALL }),
    ).toHaveLength(2);
    expect(
      filterReportRows(rows, { building: "A", floor: ALL, status: "warning" }),
    ).toEqual([rows[1]]);
  });
});
