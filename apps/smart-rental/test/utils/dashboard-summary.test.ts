import { describe, expect, it } from "vitest";

import type { Contract } from "~/types/contract";
import type { Invoice } from "~/types/invoice";
import type { Room } from "~/types/room";
import {
  buildMonthSummary,
  buildTodaySummary,
} from "~/utils/dashboard-summary";

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
    reminders: [],
    billingMonth: "2026-08",
    month: "08/2026",
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
  it("sums an invoice whose hạn thu falls this month into Còn phải thu tháng này", () => {
    const summary = buildTodaySummary(
      {
        invoices: [invoice({ dueDate: "05/09/2026", amount: 4_000_000 })],
        contracts: [],
      },
      today,
    );

    expect(summary.outstandingThisMonth).toEqual({
      amount: 4_000_000,
      overdueCount: 1,
    });
  });

  it("excludes a fully paid invoice even when its hạn thu is this month", () => {
    const summary = buildTodaySummary(
      {
        invoices: [
          invoice({
            dueDate: "05/09/2026",
            amount: 4_000_000,
            paidAmount: 4_000_000,
          }),
        ],
        contracts: [],
      },
      today,
    );

    expect(summary.outstandingThisMonth).toEqual({
      amount: 0,
      overdueCount: 0,
    });
  });

  it("excludes an invoice whose hạn thu is a different month, even if it is quá hạn", () => {
    const summary = buildTodaySummary(
      { invoices: [invoice({ dueDate: "05/08/2026" })], contracts: [] },
      today,
    );

    expect(summary.outstandingThisMonth).toEqual({
      amount: 0,
      overdueCount: 0,
    });
  });

  it("counts an on-time invoice due this month without marking it quá hạn", () => {
    const summary = buildTodaySummary(
      {
        invoices: [invoice({ dueDate: "30/09/2026", amount: 1_000_000 })],
        contracts: [],
      },
      today,
    );

    expect(summary.outstandingThisMonth).toEqual({
      amount: 1_000_000,
      overdueCount: 0,
    });
  });

  it("picks the nearest EXPIRING contract for the KPI's dòng phụ", () => {
    const summary = buildTodaySummary(
      {
        invoices: [],
        contracts: [
          contract({ id: "C010", endDate: "10/10/2026" }),
          contract({ id: "C011", endDate: "01/10/2026" }),
          // Outside the 30-day window (see contract-status.test.ts for the boundary itself).
          contract({ id: "C012", endDate: "01/01/2027" }),
        ],
      },
      today,
    );

    expect(summary.expiringContracts).toEqual({
      count: 2,
      nearestEndDate: "01/10/2026",
    });
  });
});

describe("buildMonthSummary", () => {
  it("reads đã lập/đã thu/còn phải thu off the invoices due this month", () => {
    const summary = buildMonthSummary(
      {
        invoices: [
          invoice({
            dueDate: "05/09/2026",
            amount: 4_000_000,
            paidAmount: 1_000_000,
          }),
          invoice({
            dueDate: "10/09/2026",
            amount: 2_000_000,
            paidAmount: 2_000_000,
          }),
          // Different month — excluded entirely.
          invoice({ dueDate: "05/08/2026", amount: 9_000_000, paidAmount: 0 }),
        ],
        rooms: [
          room({ status: "occupied" }),
          room({ id: "R002", status: "available" }),
        ],
      },
      today,
    );

    expect(summary).toMatchObject({
      invoicedAmount: 6_000_000,
      collectedAmount: 3_000_000,
      outstandingAmount: 3_000_000,
      occupiedRooms: 1,
      totalRooms: 2,
    });
  });
});
