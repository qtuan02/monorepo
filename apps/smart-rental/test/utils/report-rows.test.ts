import { describe, expect, it } from "vitest";

import type { Building } from "~/types/building";
import type { Invoice } from "~/types/invoice";
import type { ReportRow } from "~/types/report";
import type { Room } from "~/types/room";
import {
  buildBuildingComparisonRows,
  buildFloorOccupancy,
  buildProfitLossSummary,
  buildReportRows,
  occupancyBucket,
} from "~/utils/report-rows";

const buildings: Building[] = [
  {
    id: "b1",
    name: "Trọ Sinh Viên Xanh",
    address: "123",
    collectionDay: 5,
    priceList: {
      electricityPricePerKwh: 3500,
      waterPricePerM3: 15000,
      serviceFee: 100000,
    },
  },
  {
    id: "b2",
    name: "Chung cư B2",
    address: "456",
    collectionDay: 5,
    priceList: {
      electricityPricePerKwh: 3500,
      waterPricePerM3: 15000,
      serviceFee: 100000,
    },
  },
];

const rooms: Room[] = [
  {
    id: "r1",
    buildingId: "b1",
    name: "101",
    floor: 1,
    area: 20,
    price: 0,
    status: "occupied",
    type: "single",
    tenant: "A",
    lastUpdated: "",
  },
  {
    id: "r2",
    buildingId: "b1",
    name: "102",
    floor: 1,
    area: 20,
    price: 0,
    status: "available",
    type: "single",
    tenant: null,
    lastUpdated: "",
  },
];

function invoice(overrides: Partial<Invoice>): Invoice {
  return {
    id: "I001",
    buildingId: "b1",
    contractId: "C001",
    invoiceNumber: "HÓA-001",
    tenant: "Nguyễn Văn A",
    room: "101",
    floor: 1,
    amount: 1_000_000,
    lineItems: [],
    payments: [],
    paidAmount: 0,
    billingMonth: "2026-09",
    month: "09/2026",
    dueDate: "05/09/2026",
    status: "UNPAID",
    paymentDate: null,
    lastUpdated: "17/09/2026",
    ...overrides,
  };
}

describe("buildReportRows", () => {
  it("scopes to one Toà nhà when buildingId is given", () => {
    const rows = buildReportRows({
      buildings,
      rooms,
      invoices: [invoice({})],
      expenses: [],
      utilities: [],
      tenantViews: [],
      buildingId: "b1",
    });

    expect(rows.every((row) => row.building === "Trọ Sinh Viên Xanh")).toBe(
      true,
    );
  });

  it("covers every Toà nhà when buildingId is null", () => {
    const rows = buildReportRows({
      buildings,
      rooms,
      invoices: [invoice({})],
      expenses: [],
      utilities: [],
      tenantViews: [],
      buildingId: null,
    });

    expect(new Set(rows.map((row) => row.building))).toEqual(
      new Set(["Trọ Sinh Viên Xanh", "Chung cư B2"]),
    );
  });

  it("computes occupancyRate from the Toà nhà's own Phòng", () => {
    const rows = buildReportRows({
      buildings,
      rooms,
      invoices: [invoice({})],
      expenses: [],
      utilities: [],
      tenantViews: [],
      buildingId: "b1",
    });

    expect(rows[0]?.occupancyRate).toBe(50);
  });
});

describe("buildProfitLossSummary", () => {
  it("sums revenue and expenses across every row", () => {
    const summary = buildProfitLossSummary([
      {
        month: "09/2026",
        building: "b1",
        floor: "Tất cả tầng",
        revenue: 1000,
        expenses: 400,
        profit: 600,
        occupancyRate: 80,
        waterUsage: 0,
        electricityUsage: 0,
        overdueTenants: 0,
        totalTenants: 1,
      },
    ]);

    expect(summary).toEqual({
      totalRevenue: 1000,
      totalExpenses: 400,
      totalProfit: 600,
      avgOccupancy: 80,
    });
  });
});

describe("occupancyBucket", () => {
  it("is good from 90, warning from 70, critical below", () => {
    expect(occupancyBucket(90)).toBe("good");
    expect(occupancyBucket(89)).toBe("warning");
    expect(occupancyBucket(70)).toBe("warning");
    expect(occupancyBucket(69)).toBe("critical");
  });
});

describe("buildFloorOccupancy", () => {
  const room = (patch: Partial<Room>): Room => ({
    id: "r0",
    buildingId: "b1",
    name: "",
    area: 20,
    price: 0,
    status: "occupied",
    type: "single",
    tenant: null,
    lastUpdated: "",
    floor: 1,
    ...patch,
  });

  it("groups by floor and computes occupied/total for each", () => {
    const result = buildFloorOccupancy([
      room({ id: "r1", floor: 1, status: "occupied" }),
      room({ id: "r2", floor: 1, status: "available" }),
      room({ id: "r3", floor: 2, status: "occupied" }),
    ]);

    expect(result).toEqual([
      { floor: 1, occupancyRate: 50 },
      { floor: 2, occupancyRate: 100 },
    ]);
  });

  it("sorts floors ascending", () => {
    const result = buildFloorOccupancy([
      room({ id: "r1", floor: 3 }),
      room({ id: "r2", floor: 1 }),
    ]);

    expect(result.map((row) => row.floor)).toEqual([1, 3]);
  });
});

describe("buildBuildingComparisonRows", () => {
  const row = (patch: Partial<ReportRow>): ReportRow => ({
    month: "09/2026",
    building: "b1",
    floor: "Tất cả tầng",
    revenue: 0,
    expenses: 0,
    profit: 0,
    occupancyRate: 0,
    waterUsage: 0,
    electricityUsage: 0,
    overdueTenants: 0,
    totalTenants: 0,
    ...patch,
  });

  it("totals revenue/expenses/profit across every kỳ of the same Toà nhà", () => {
    const comparison = buildBuildingComparisonRows([
      row({ building: "A", revenue: 1000, expenses: 400, profit: 600 }),
      row({ building: "A", revenue: 1200, expenses: 500, profit: 700 }),
      row({ building: "B", revenue: 2000, expenses: 800, profit: 1200 }),
    ]);

    expect(comparison).toEqual([
      {
        building: "A",
        revenue: 2200,
        expenses: 900,
        profit: 1300,
        occupancyRate: 0,
      },
      {
        building: "B",
        revenue: 2000,
        expenses: 800,
        profit: 1200,
        occupancyRate: 0,
      },
    ]);
  });
});
