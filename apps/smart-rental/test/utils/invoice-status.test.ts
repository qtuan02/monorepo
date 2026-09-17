import { describe, expect, it } from "vitest";

import {
  canDeleteInvoice,
  daysOverdue,
  deriveInvoiceStatus,
} from "~/utils/invoice-status";

const today = new Date("2026-09-17T00:00:00.000Z");

describe("deriveInvoiceStatus", () => {
  it("passes DRAFT and CANCELLED through unchanged", () => {
    expect(
      deriveInvoiceStatus(
        { status: "DRAFT", amount: 1000, paidAmount: 0, dueDate: "01/01/2020" },
        today,
      ),
    ).toBe("DRAFT");
    expect(
      deriveInvoiceStatus(
        {
          status: "CANCELLED",
          amount: 1000,
          paidAmount: 0,
          dueDate: "01/01/2020",
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
          dueDate: "05/09/2026",
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
          dueDate: "20/09/2026",
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
          dueDate: "05/09/2026",
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
          dueDate: "16/09/2026",
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
          dueDate: "17/09/2026",
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
    expect(daysOverdue("17/09/2026", today)).toBe(0);
    expect(daysOverdue("20/09/2026", today)).toBe(0);
  });

  it("counts whole days past the due date", () => {
    expect(daysOverdue("12/09/2026", today)).toBe(5);
  });
});
