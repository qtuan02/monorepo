import { describe, expect, it } from "vitest";

import {
  canDeleteInvoice,
  daysOverdue,
  deriveInvoiceStatus,
  invoiceStatusBadgeConfig,
} from "~/utils/invoice-status";

const today = new Date("2026-09-17T00:00:00.000Z");

describe("deriveInvoiceStatus", () => {
  it("passes DRAFT and CANCELLED through unchanged", () => {
    expect(
      deriveInvoiceStatus(
        { status: "DRAFT", amount: 1000, paidAmount: 0, dueDate: "2020-01-01" },
        today,
      ),
    ).toBe("DRAFT");
    expect(
      deriveInvoiceStatus(
        {
          status: "CANCELLED",
          amount: 1000,
          paidAmount: 0,
          dueDate: "2020-01-01",
        },
        today,
      ),
    ).toBe("CANCELLED");
  });

  it("is PAID exactly when the total paid equals the total lines", () => {
    expect(
      deriveInvoiceStatus(
        {
          status: "UNPAID",
          amount: 1000,
          paidAmount: 1000,
          dueDate: "2026-09-05",
        },
        today,
      ),
    ).toBe("PAID");
  });

  it("is PARTIAL when something was paid, still ahead of the due date", () => {
    expect(
      deriveInvoiceStatus(
        {
          status: "UNPAID",
          amount: 1000,
          paidAmount: 400,
          dueDate: "2026-09-20",
        },
        today,
      ),
    ).toBe("PARTIAL");
  });

  it("is OVERDUE, not PARTIAL, once a partly-paid invoice is past its due date", () => {
    expect(
      deriveInvoiceStatus(
        {
          status: "UNPAID",
          amount: 1000,
          paidAmount: 400,
          dueDate: "2026-09-05",
        },
        today,
      ),
    ).toBe("OVERDUE");
  });

  it("is OVERDUE exactly one day past the due date with nothing paid", () => {
    expect(
      deriveInvoiceStatus(
        {
          status: "UNPAID",
          amount: 1000,
          paidAmount: 0,
          dueDate: "2026-09-16",
        },
        today,
      ),
    ).toBe("OVERDUE");
  });

  it("is UNPAID, not OVERDUE, on the due date itself", () => {
    expect(
      deriveInvoiceStatus(
        {
          status: "UNPAID",
          amount: 1000,
          paidAmount: 0,
          dueDate: "2026-09-17",
        },
        today,
      ),
    ).toBe("UNPAID");
  });
});

describe("canDeleteInvoice", () => {
  it("allows Nháp only", () => {
    expect(canDeleteInvoice({ status: "DRAFT" })).toBe(true);
    expect(canDeleteInvoice({ status: "UNPAID" })).toBe(false);
    expect(canDeleteInvoice({ status: "PAID" })).toBe(false);
  });
});

describe("daysOverdue", () => {
  it("is 0 on and before the due date", () => {
    expect(daysOverdue("2026-09-17", today)).toBe(0);
    expect(daysOverdue("2026-09-20", today)).toBe(0);
  });

  it("counts whole days past the due date", () => {
    expect(daysOverdue("2026-09-12", today)).toBe(5);
  });
});

describe("invoiceStatusBadgeConfig", () => {
  it("carries the day count on the label only for OVERDUE", () => {
    expect(
      invoiceStatusBadgeConfig(
        { status: "OVERDUE", dueDate: "2026-09-12" },
        today,
      ).label,
    ).toBe("Quá hạn 5 ngày");
  });

  it("keeps the plain config label for every other status", () => {
    expect(
      invoiceStatusBadgeConfig(
        { status: "UNPAID", dueDate: "2026-09-20" },
        today,
      ).label,
    ).toBe("Chưa thu");
  });
});
