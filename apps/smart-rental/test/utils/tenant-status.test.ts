import { describe, expect, it } from "vitest";

import type { Contract } from "~/types/contract";
import type { Invoice } from "~/types/invoice";
import { deriveTenantStatus, hasOverdueInvoice } from "~/utils/tenant-status";

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
    paymentDueDay: 5,
    noticeDays: 30,
    startDate: "01/01/2026",
    endDate: "31/12/2027",
    status: "ACTIVE",
    renewalHistory: [],
    lastUpdated: "01/09/2026",
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
    billingMonth: "2026-09",
    month: "09/2026",
    dueDate: "05/09/2026",
    status: "UNPAID",
    paymentDate: null,
    lastUpdated: "17/09/2026",
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
        [contract({ status: "TERMINATED", endDate: "01/01/2026" })],
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
