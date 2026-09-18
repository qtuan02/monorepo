import { describe, expect, it } from "vitest";

import type { PriceList } from "~/types/building";
import type { Utility } from "~/types/utility";
import {
  calculateUtilityStats,
  estimateUtilityCost,
} from "~/features/utilities/utils/meter-reading";

const priceList: PriceList = {
  electricityPricePerKwh: 3500,
  waterPricePerM3: 8000,
  serviceFee: 0,
};

function utility(overrides: Partial<Utility>): Utility {
  return {
    id: "u1",
    buildingId: "b1",
    roomId: "room-001",
    roomName: "Phòng 101",
    month: "2026-08",
    type: "water",
    oldIndex: 1,
    newIndex: 2,
    consumption: 1,
    status: "DRAFT",
    approved: false,
    updatedAt: "2026-08-25T10:30:00Z",
    proofImages: [],
    ...overrides,
  };
}

describe("estimateUtilityCost", () => {
  it("prices off the Toà nhà's own Bảng giá, never a hard-coded rate", () => {
    expect(estimateUtilityCost("electricity", 150, priceList)).toBe(525000);
    expect(estimateUtilityCost("water", 7, priceList)).toBe(56000);

    const otherPriceList: PriceList = {
      ...priceList,
      electricityPricePerKwh: 3800,
    };
    expect(estimateUtilityCost("electricity", 150, otherPriceList)).toBe(
      570000,
    );
  });
});

describe("calculateUtilityStats", () => {
  it("scopes finalized/draft/anomaly counts to the latest kỳ present, not a running total", () => {
    const utilities: Utility[] = [
      utility({
        id: "aug-finalized",
        month: "2026-08",
        status: "FINALIZED",
        consumption: 100,
      }),
      utility({
        id: "sep-finalized",
        month: "2026-09",
        status: "FINALIZED",
        consumption: 90,
      }),
      utility({
        id: "sep-draft",
        roomId: "room-002",
        month: "2026-09",
        status: "DRAFT",
      }),
    ];

    expect(calculateUtilityStats(utilities)).toEqual({
      month: "2026-09",
      finalizedCount: 1,
      draftCount: 1,
      anomalyCount: 0,
    });
  });

  it("still catches a > 2× anomaly by comparing against the FULL list before scoping to the kỳ", () => {
    const utilities: Utility[] = [
      utility({
        id: "aug",
        roomId: "room-003",
        month: "2026-08",
        status: "FINALIZED",
        oldIndex: 1000,
        newIndex: 1100,
        consumption: 100,
      }),
      utility({
        id: "sep-anomaly",
        roomId: "room-003",
        month: "2026-09",
        status: "DRAFT",
        oldIndex: 1100,
        newIndex: 1350,
        consumption: 250,
      }),
    ];

    expect(calculateUtilityStats(utilities).anomalyCount).toBe(1);
  });

  it("returns a null kỳ over an empty list", () => {
    expect(calculateUtilityStats([])).toEqual({
      month: null,
      finalizedCount: 0,
      draftCount: 0,
      anomalyCount: 0,
    });
  });
});
