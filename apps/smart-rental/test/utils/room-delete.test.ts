import { describe, expect, it } from "vitest";

import dayjs from "@monorepo/dayjs";
import { DATE_FORMAT } from "@monorepo/dayjs/formats";

import type { Contract } from "~/types/contract";
import { canDeleteRoom } from "~/utils/room-delete";

function contract(
  overrides: Partial<Contract>,
): Pick<Contract, "roomId" | "status" | "endDate"> {
  return {
    roomId: "R-B1-101",
    status: "ACTIVE",
    endDate: "2099-01-01",
    ...overrides,
  };
}

const inDays = (days: number) => dayjs().add(days, "day").format(DATE_FORMAT);

describe("canDeleteRoom", () => {
  it("allows deletion when the room has no contracts at all", () => {
    expect(canDeleteRoom("R-B1-101", [])).toBe(true);
  });

  it("blocks deletion while an ACTIVE contract still references the room", () => {
    const contracts = [contract({ status: "ACTIVE" })];
    expect(canDeleteRoom("R-B1-101", contracts)).toBe(false);
  });

  it("blocks deletion for a contract that derives EXPIRING too (still live)", () => {
    const contracts = [
      contract({ status: "ACTIVE", endDate: inDays(10) }), // ≤ 30 days → EXPIRING
    ];
    expect(canDeleteRoom("R-B1-101", contracts)).toBe(false);
  });

  it("does not block on an ACTIVE-flagged contract whose endDate already passed", () => {
    const contracts = [contract({ status: "ACTIVE", endDate: inDays(-10) })];
    expect(canDeleteRoom("R-B1-101", contracts)).toBe(true);
  });

  it("ignores a TERMINATED contract, and one on another room", () => {
    const contracts = [
      contract({ status: "TERMINATED" }),
      contract({ roomId: "R-B1-102", status: "ACTIVE" }),
    ];
    expect(canDeleteRoom("R-B1-101", contracts)).toBe(true);
  });
});
