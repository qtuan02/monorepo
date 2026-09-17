import { describe, expect, it } from "vitest";

import dayjs from "@monorepo/dayjs";
import { DATE_FORMAT } from "@monorepo/dayjs/formats";

import type { Contract } from "~/types/contract";
import { canDeleteBuilding } from "~/utils/building-delete";

function contract(
  overrides: Partial<Contract>,
): Pick<Contract, "buildingId" | "status" | "endDate"> {
  return {
    buildingId: "b1",
    status: "ACTIVE",
    endDate: "2099-01-01",
    ...overrides,
  };
}

const inDays = (days: number) => dayjs().add(days, "day").format(DATE_FORMAT);

describe("canDeleteBuilding", () => {
  it("allows deletion when the building has no contracts at all", () => {
    expect(canDeleteBuilding("b1", [])).toBe(true);
  });

  it("blocks deletion while an ACTIVE contract still references the building", () => {
    const contracts = [contract({ status: "ACTIVE" })];
    expect(canDeleteBuilding("b1", contracts)).toBe(false);
  });

  it("blocks deletion for a contract that derives EXPIRING too (still live)", () => {
    const contracts = [
      contract({ status: "ACTIVE", endDate: inDays(10) }), // ≤ 30 days → EXPIRING
    ];
    expect(canDeleteBuilding("b1", contracts)).toBe(false);
  });

  it("does not block on an ACTIVE-flagged contract whose endDate already passed", () => {
    // ADR-0012: EXPIRED is never trusted from a stored `status` — it is
    // derived fresh from `endDate`, so a stale ACTIVE flag past its end
    // date must not keep the building undeletable forever.
    const contracts = [contract({ status: "ACTIVE", endDate: inDays(-10) })];
    expect(canDeleteBuilding("b1", contracts)).toBe(true);
  });

  it("ignores a TERMINATED contract, and one on another building", () => {
    const contracts = [
      contract({ status: "TERMINATED" }),
      contract({ buildingId: "b2", status: "ACTIVE" }),
    ];
    expect(canDeleteBuilding("b1", contracts)).toBe(true);
  });
});
