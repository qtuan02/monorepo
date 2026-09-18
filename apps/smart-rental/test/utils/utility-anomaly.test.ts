import { describe, expect, it } from "vitest";

import type { Utility } from "~/types/utility";
import {
  findAnomalousUtilities,
  isUtilityAnomalous,
  UTILITY_ANOMALY_MULTIPLIER,
} from "~/utils/utility-anomaly";

function reading(overrides: Partial<Utility>): Utility {
  return {
    id: "u1",
    buildingId: "b1",
    roomId: "r1",
    roomName: "Phòng 101",
    month: "2026-09",
    type: "electricity",
    oldIndex: 1000,
    newIndex: 1100,
    consumption: 100,
    status: "DRAFT",
    approved: false,
    updatedAt: "2026-09-15T00:00:00.000Z",
    proofImages: [],
    ...overrides,
  };
}

describe("isUtilityAnomalous", () => {
  it("is anomalous when the new index is lower than the old one", () => {
    expect(
      isUtilityAnomalous(
        reading({ oldIndex: 1000, newIndex: 999, consumption: -1 }),
      ),
    ).toBe(true);
  });

  it("is not anomalous when the new index equals the old one — 0 tiêu thụ, not a regression", () => {
    expect(
      isUtilityAnomalous(
        reading({ oldIndex: 1000, newIndex: 1000, consumption: 0 }),
      ),
    ).toBe(false);
  });

  it("has no previous period to compare against — never anomalous by ratio", () => {
    expect(isUtilityAnomalous(reading({ consumption: 1000 }))).toBe(false);
  });

  it(`is not anomalous at exactly ${UTILITY_ANOMALY_MULTIPLIER}× the previous period`, () => {
    expect(
      isUtilityAnomalous(reading({ consumption: 200 }), { consumption: 100 }),
    ).toBe(false);
  });

  it(`is anomalous just past ${UTILITY_ANOMALY_MULTIPLIER}× the previous period`, () => {
    expect(
      isUtilityAnomalous(reading({ consumption: 201 }), { consumption: 100 }),
    ).toBe(true);
  });

  it("a duyệt-ed reading never counts as anomalous by ratio (ticket #183)", () => {
    expect(
      isUtilityAnomalous(reading({ consumption: 500, approved: true }), {
        consumption: 100,
      }),
    ).toBe(false);
  });
});

describe("findAnomalousUtilities", () => {
  it("pairs readings by Phòng + loại, ascending by month", () => {
    const utilities: Utility[] = [
      reading({ id: "u-aug", month: "2026-08", consumption: 100 }),
      reading({
        id: "u-sep",
        month: "2026-09",
        oldIndex: 1100,
        newIndex: 1350,
        consumption: 250,
      }),
      // A different Phòng's own history must not be compared against it.
      reading({
        id: "u-other-room",
        roomId: "r2",
        roomName: "Phòng 102",
        month: "2026-09",
        consumption: 100,
      }),
    ];

    expect(findAnomalousUtilities(utilities).map((u) => u.id)).toEqual([
      "u-sep",
    ]);
  });
});
