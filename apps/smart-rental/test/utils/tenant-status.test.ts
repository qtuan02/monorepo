import { describe, expect, it } from "vitest";

import type { Contract } from "~/types/contract";
import type { Invoice } from "~/types/invoice";
import type { Tenant } from "~/types/tenant";
import {
  deriveTenantStatus,
  findTenantContract,
  hasOverdueInvoice,
  toTenantView,
} from "~/utils/tenant-status";

const today = new Date("2026-09-17T00:00:00.000Z");

function contract(overrides: Partial<Contract>): Contract {
  return {
    id: "C001",
    buildingId: "b1",
    roomId: "R1",
    tenantId: "T001",
    contractNumber: "HĐ-001",
    tenant: "Nguyễn Văn A",
    room: "Phòng 101",
    floor: 1,
    rentAmount: 2_000_000,
    depositAmount: 2_000_000,
    depositStatus: "HELD",
    depositReturnedAmount: 0,
    noticeDays: 30,
    startDate: "2026-01-01",
    endDate: "2027-12-31",
    status: "ACTIVE",
    renewalHistory: [],
    lastUpdated: "2026-09-01",
    ...overrides,
  };
}

function tenant(overrides: Partial<Tenant> = {}): Tenant {
  return {
    id: "T001",
    buildingId: "b1",
    name: "Nguyễn Văn A",
    phone: "0905000001",
    email: "a@gmail.com",
    idNumber: "079000000001",
    gender: "male",
    ...overrides,
  };
}

function invoice(overrides: Partial<Invoice>): Invoice {
  return {
    id: "I001",
    buildingId: "b1",
    contractId: "C001",
    invoiceNumber: "HÓA-001",
    tenant: "Nguyễn Văn A",
    room: "Phòng 101",
    floor: 1,
    amount: 1_000_000,
    lineItems: [],
    payments: [],
    paidAmount: 0,
    reminders: [],
    billingMonth: "2026-09",
    dueDate: "2026-09-05",
    status: "UNPAID",
    paymentDate: null,
    lastUpdated: "2026-09-17",
    ...overrides,
  };
}

describe("deriveTenantStatus", () => {
  it("is active with a live contract", () => {
    expect(deriveTenantStatus("T001", [contract({})], today)).toBe("active");
  });

  it("is ended with no contract at all", () => {
    expect(deriveTenantStatus("T001", [], today)).toBe("ended");
  });

  it("is ended once every contract has expired or been terminated", () => {
    expect(
      deriveTenantStatus(
        "T001",
        [contract({ status: "TERMINATED", endDate: "2026-01-01" })],
        today,
      ),
    ).toBe("ended");
  });
});

describe("hasOverdueInvoice", () => {
  it("is true when a Hoá đơn on the tenant's own contract is OVERDUE", () => {
    expect(
      hasOverdueInvoice("T001", [contract({})], [invoice({})], today),
    ).toBe(true);
  });

  it("ignores an overdue Hoá đơn that belongs to another tenant's contract", () => {
    expect(
      hasOverdueInvoice(
        "T001",
        [contract({})],
        [invoice({ contractId: "C-other" })],
        today,
      ),
    ).toBe(false);
  });

  it("is false once the invoice is paid", () => {
    expect(
      hasOverdueInvoice(
        "T001",
        [contract({})],
        [invoice({ paidAmount: 1_000_000 })],
        today,
      ),
    ).toBe(false);
  });
});

describe("findTenantContract (ADR-0015 §2)", () => {
  it("picks the live contract over an ended one", () => {
    const live = contract({ id: "C-live", status: "ACTIVE" });
    const ended = contract({
      id: "C-ended",
      status: "TERMINATED",
      endDate: "2026-01-01",
    });

    expect(findTenantContract("T001", [ended, live])?.id).toBe("C-live");
  });

  it("falls back to the most recently ended contract once none is live", () => {
    const older = contract({
      id: "C-older",
      status: "TERMINATED",
      endDate: "2026-06-01",
    });
    const newer = contract({
      id: "C-newer",
      status: "TERMINATED",
      endDate: "2026-08-01",
    });

    expect(findTenantContract("T001", [older, newer])?.id).toBe("C-newer");
  });

  it("is undefined for a tenant with no contract at all", () => {
    expect(findTenantContract("T001", [])).toBeUndefined();
  });
});

describe("toTenantView (ADR-0015 §2)", () => {
  const world = { invoices: [invoice({})], today };

  it("joins room/floor/rentAmount/depositAmount/moveInDate/contractEnd off the live contract", () => {
    const view = toTenantView(tenant({}), {
      ...world,
      contracts: [contract({ status: "ACTIVE" })],
    });

    expect(view).toMatchObject({
      room: "Phòng 101",
      floor: 1,
      rentAmount: 2_000_000,
      depositAmount: 2_000_000,
      moveInDate: "2026-01-01",
      contractEnd: "2027-12-31",
    });
  });

  it("falls back to the placeholder blanks with no contract at all", () => {
    const view = toTenantView(tenant({}), { ...world, contracts: [] });

    expect(view).toMatchObject({
      room: "—",
      floor: 0,
      rentAmount: 0,
      depositAmount: 0,
      moveInDate: "—",
      contractEnd: "—",
    });
  });
});
