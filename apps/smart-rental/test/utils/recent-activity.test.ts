import { describe, expect, it } from "vitest";

import type { Contract } from "~/types/contract";
import type { Invoice } from "~/types/invoice";
import { formatCurrency } from "~/utils/currency";
import { buildRecentActivity } from "~/utils/recent-activity";

function invoice(overrides: Partial<Invoice> = {}): Invoice {
  return {
    id: "I001",
    buildingId: "b1",
    contractId: "C001",
    invoiceNumber: "HÓA-001",
    tenant: "Nguyễn Văn A",
    room: "Phòng 101",
    floor: 1,
    amount: 3_000_000,
    lineItems: [],
    payments: [],
    paidAmount: 0,
    reminders: [],
    billingMonth: "2026-08",
    dueDate: "2026-09-05",
    status: "PAID",
    paymentDate: null,
    lastUpdated: "2026-09-18",
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
    rentAmount: 3_000_000,
    depositAmount: 3_000_000,
    depositStatus: "HELD",
    depositReturnedAmount: 0,
    noticeDays: 30,
    startDate: "2026-01-01",
    endDate: "2027-01-01",
    status: "ACTIVE",
    renewalHistory: [],
    lastUpdated: "2026-09-18",
    ...overrides,
  };
}

describe("buildRecentActivity", () => {
  it("reads a Thanh toán as its own entry, newest first", () => {
    const entries = buildRecentActivity({
      invoices: [
        invoice({
          invoiceNumber: "HÓA-070",
          room: "Phòng 105",
          payments: [
            {
              amount: 3_000_000,
              method: "BANK_TRANSFER",
              paidAt: "2026-09-17",
            },
          ],
        }),
      ],
      contracts: [],
    });

    expect(entries).toEqual([
      {
        kind: "payment",
        at: "2026-09-17",
        label: "Thu HÓA-070 · Phòng 105",
        detail: `${formatCurrency(3_000_000)} · Chuyển khoản`,
      },
    ]);
  });

  it("collapses reminders sent to several Hoá đơn at the same instant into one entry", () => {
    const sentAt = "2026-09-16T09:00:00.000Z";
    const entries = buildRecentActivity({
      invoices: [
        invoice({ id: "I001", reminders: [{ channel: "zalo", sentAt }] }),
        invoice({ id: "I002", reminders: [{ channel: "zalo", sentAt }] }),
        invoice({ id: "I003", reminders: [{ channel: "zalo", sentAt }] }),
        invoice({ id: "I004", reminders: [{ channel: "zalo", sentAt }] }),
      ],
      contracts: [],
    });

    expect(entries).toEqual([
      {
        kind: "reminder",
        at: sentAt,
        label: "Nhắc 4 hoá đơn qua Zalo",
        detail: "đã ghi nhật ký",
      },
    ]);
  });

  it("reads a Gia hạn from the contract's own renewalHistory", () => {
    const entries = buildRecentActivity({
      invoices: [],
      contracts: [
        contract({
          contractNumber: "HĐ-003",
          room: "Phòng 103",
          renewalHistory: [
            {
              renewedAt: "2026-09-15T00:00:00.000Z",
              previousEndDate: "2026-09-15",
              newEndDate: "2027-09-15",
              previousRentAmount: 3_000_000,
              newRentAmount: 3_000_000,
            },
          ],
        }),
      ],
    });

    expect(entries).toEqual([
      {
        kind: "renewal",
        at: "2026-09-15T00:00:00.000Z",
        label: "Gia hạn HĐ-003 · Phòng 103",
        detail: "đến 15/09/2027",
      },
    ]);
  });

  it("caps at `limit`, newest first across all three sources", () => {
    const entries = buildRecentActivity(
      {
        invoices: [
          invoice({
            id: "I001",
            payments: [{ amount: 1, method: "CASH", paidAt: "2026-09-01" }],
          }),
          invoice({
            id: "I002",
            payments: [{ amount: 1, method: "CASH", paidAt: "2026-09-10" }],
          }),
        ],
        contracts: [
          contract({
            renewalHistory: [
              {
                renewedAt: "2026-09-05T00:00:00.000Z",
                previousEndDate: "2026-09-01",
                newEndDate: "2027-09-01",
                previousRentAmount: 1,
                newRentAmount: 1,
              },
            ],
          }),
        ],
      },
      2,
    );

    expect(entries).toHaveLength(2);
    expect(entries[0]?.at).toBe("2026-09-10");
    expect(entries[1]?.at).toBe("2026-09-05T00:00:00.000Z");
  });
});
