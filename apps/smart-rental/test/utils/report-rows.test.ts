import { describe, expect, it } from "vitest";

import type { Building } from "~/types/building";
import type { Invoice } from "~/types/invoice";
import type { Room } from "~/types/room";
import {
  buildOverdueDebts,
  buildProfitLossSummary,
  buildReportRows,
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
    reminders: [],
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

describe("buildOverdueDebts", () => {
  const today = new Date("2026-09-17T00:00:00.000Z");

  it("only lists an invoice that derives OVERDUE", () => {
    const debts = buildOverdueDebts(
      [
        invoice({ dueDate: "05/09/2026" }),
        invoice({ id: "I002", paidAmount: 1_000_000 }),
      ],
      today,
    );

    expect(debts.map((debt) => debt.id)).toEqual(["I001"]);
  });

  it("reports the remaining amount, not the full invoice total", () => {
    const [debt] = buildOverdueDebts(
      [
        invoice({
          dueDate: "05/09/2026",
          amount: 1_000_000,
          paidAmount: 300_000,
        }),
      ],
      today,
    );

    expect(debt?.amount).toBe(700_000);
  });
});
