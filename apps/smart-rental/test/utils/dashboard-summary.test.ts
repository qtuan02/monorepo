import { describe, expect, it } from "vitest";

import type { Contract } from "~/types/contract";
import type { Invoice } from "~/types/invoice";
import type { Room } from "~/types/room";
import { buildTodaySummary } from "~/utils/dashboard-summary";

const today = new Date("2026-09-17T00:00:00.000Z");

function invoice(overrides: Partial<Invoice> = {}): Invoice {
  return {
    id: "I001",
    buildingId: "b1",
    contractId: "C001",
    invoiceNumber: "HÓA-001",
    tenant: "Nguyễn Văn A",
    room: "Phòng 101",
    floor: 1,
    amount: 4_000_000,
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

function contract(overrides: Partial<Contract> = {}): Contract {
  return {
    id: "C001",
    buildingId: "b1",
    roomId: "R001",
    tenantId: "T001",
    contractNumber: "HĐ-001",
    tenant: "Nguyễn Văn A",
    room: "Phòng 101",
    floor: 1,
    rentAmount: 3_500_000,
    depositAmount: 3_500_000,
    depositStatus: "HELD",
    depositReturnedAmount: 0,
    paymentDueDay: 5,
    noticeDays: 30,
    startDate: "01/01/2026",
    endDate: "17/12/2026",
    status: "ACTIVE",
    renewalHistory: [],
    lastUpdated: "17/09/2026",
    ...overrides,
  };
}

function room(overrides: Partial<Room> = {}): Room {
  return {
    id: "R001",
    buildingId: "b1",
    name: "Phòng 101",
    floor: 1,
    area: 20,
    price: 3_500_000,
    status: "occupied",
    type: "single",
    tenant: "Nguyễn Văn A",
    lastUpdated: "17/09/2026",
    ...overrides,
  };
}

describe("buildTodaySummary", () => {
  it("sums an invoice past its due date into both Cần thu tháng này and Quá hạn", () => {
    const summary = buildTodaySummary(
      {
        invoices: [
          invoice({
            billingMonth: "2026-09",
            dueDate: "05/09/2026",
            amount: 4_000_000,
            paidAmount: 0,
          }),
        ],
        contracts: [],
        rooms: [],
      },
      today,
    );

    expect(summary.dueThisMonth).toEqual({ amount: 4_000_000, count: 1 });
    expect(summary.overdue.amount).toBe(4_000_000);
    expect(summary.overdue.count).toBe(1);
    expect(summary.overdue.maxDaysOverdue).toBe(12);
  });

  it("excludes a fully paid invoice from Cần thu tháng này even in the current kỳ", () => {
    const summary = buildTodaySummary(
      {
        invoices: [
          invoice({
            billingMonth: "2026-09",
            amount: 4_000_000,
            paidAmount: 4_000_000,
            status: "PAID",
          }),
        ],
        contracts: [],
        rooms: [],
      },
      today,
    );

    expect(summary.dueThisMonth).toEqual({ amount: 0, count: 0 });
    expect(summary.overdue).toEqual({ amount: 0, count: 0, maxDaysOverdue: 0 });
  });

  it("excludes an invoice from an earlier kỳ out of Cần thu tháng này, but still counts it as Quá hạn", () => {
    const summary = buildTodaySummary(
      {
        invoices: [invoice({ billingMonth: "2026-08", dueDate: "05/08/2026" })],
        contracts: [],
        rooms: [],
      },
      today,
    );

    expect(summary.dueThisMonth).toEqual({ amount: 0, count: 0 });
    expect(summary.overdue.count).toBe(1);
  });

  it("picks the nearest EXPIRING contract for the KPI's description", () => {
    const summary = buildTodaySummary(
      {
        invoices: [],
        contracts: [
          contract({ id: "C010", room: "Phòng 210", endDate: "10/10/2026" }),
          contract({ id: "C011", room: "Phòng 211", endDate: "01/10/2026" }),
          // Outside the 30-day window (see contract-status.test.ts for the boundary itself).
          contract({ id: "C012", room: "Phòng 212", endDate: "01/01/2027" }),
        ],
        rooms: [],
      },
      today,
    );

    expect(summary.expiringContracts).toEqual({
      count: 2,
      nearestEndDate: "01/10/2026",
      nearestRoom: "Phòng 211",
    });
  });

  it("aggregates revenue by kỳ, sorted, in triệu VND", () => {
    const summary = buildTodaySummary(
      {
        invoices: [
          invoice({ billingMonth: "2026-09", amount: 3_000_000 }),
          invoice({ billingMonth: "2026-08", amount: 2_000_000 }),
          invoice({ billingMonth: "2026-08", amount: 1_000_000 }),
        ],
        contracts: [],
        rooms: [],
      },
      today,
    );

    expect(summary.revenueByMonth).toEqual([
      { month: "Thg 8", value: 3 },
      { month: "Thg 9", value: 3 },
    ]);
  });

  it("splits occupancy and names the trống rooms", () => {
    const summary = buildTodaySummary(
      {
        invoices: [],
        contracts: [],
        rooms: [
          room({ id: "R101", name: "Phòng 101", status: "occupied" }),
          room({ id: "R102", name: "Phòng 102", status: "available" }),
          room({ id: "R103", name: "Phòng 103", status: "available" }),
        ],
      },
      today,
    );

    expect(summary.occupancy).toEqual({
      occupied: 1,
      vacant: 2,
      vacantRoomNames: ["Phòng 102", "Phòng 103"],
    });
  });
});
