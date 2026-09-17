import { describe, expect, it } from "vitest";

import {
  CONTRACT_EXPIRING_WINDOW_DAYS,
  daysUntilContractEnd,
  deriveContractStatus,
  isContractLive,
} from "~/utils/contract-status";

const today = new Date("2026-09-17T00:00:00.000Z");

describe("deriveContractStatus", () => {
  it("passes DRAFT and TERMINATED through unchanged, never date-derived", () => {
    expect(
      deriveContractStatus({ status: "DRAFT", endDate: "01/01/2020" }, today),
    ).toBe("DRAFT");
    expect(
      deriveContractStatus(
        { status: "TERMINATED", endDate: "31/12/2099" },
        today,
      ),
    ).toBe("TERMINATED");
  });

  it(`is EXPIRING exactly at the ${CONTRACT_EXPIRING_WINDOW_DAYS}-day boundary`, () => {
    expect(
      deriveContractStatus({ status: "ACTIVE", endDate: "17/10/2026" }, today),
    ).toBe("EXPIRING");
  });

  it("is ACTIVE one day past the boundary", () => {
    expect(
      deriveContractStatus({ status: "ACTIVE", endDate: "18/10/2026" }, today),
    ).toBe("ACTIVE");
  });

  it("is EXPIRED once the end date has passed", () => {
    expect(
      deriveContractStatus({ status: "ACTIVE", endDate: "16/09/2026" }, today),
    ).toBe("EXPIRED");
  });
});

describe("isContractLive", () => {
  it("is true for EXPIRING, false for EXPIRED", () => {
    expect(
      isContractLive({ status: "ACTIVE", endDate: "17/10/2026" }, today),
    ).toBe(true);
    expect(
      isContractLive({ status: "ACTIVE", endDate: "16/09/2026" }, today),
    ).toBe(false);
  });
});

describe("daysUntilContractEnd", () => {
  it("counts forward to a future end date, negative once past", () => {
    expect(daysUntilContractEnd("17/10/2026", today)).toBe(30);
    expect(daysUntilContractEnd("16/09/2026", today)).toBe(-1);
  });
});
