import { describe, expect, it } from "vitest";

import type { PriceList } from "~/types/building";
import type { Utility } from "~/types/utility";
import {
  calculateUtilityStats,
  combineMeterStatus,
  estimateUtilityCost,
  readMeter,
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
    updatedAt: "2026-08-25T10:30:00Z",
    proofImages: [],
    ...overrides,
  };
}

describe("readMeter", () => {
  it("is empty until something is typed", () => {
    expect(readMeter(1250, "")).toEqual({ consumption: null, status: null });
    expect(readMeter(1250, "  ")).toEqual({ consumption: null, status: null });
  });

  it("consumption is new − old, as a draft, under 2× the previous period", () => {
    expect(readMeter(1250, "1300", 40)).toEqual({
      consumption: 50,
      status: "draft",
    });
  });

  it("flags a reading below the last one as an anomaly", () => {
    expect(readMeter(1250, "1200")).toEqual({
      consumption: -50,
      status: "anomaly",
    });
  });

  it("flags consumption above 2× the previous period as an anomaly (ADR-0012)", () => {
    expect(readMeter(1000, "1250", 100)).toEqual({
      consumption: 250,
      status: "anomaly",
    });
  });

  it("has no previous period to compare against — never anomalous by ratio", () => {
    expect(readMeter(1000, "5000")).toEqual({
      consumption: 4000,
      status: "draft",
    });
  });

  it("flags a non-number as an anomaly rather than NaN", () => {
    expect(readMeter(1250, "abc")).toEqual({
      consumption: null,
      status: "anomaly",
    });
  });
});

describe("combineMeterStatus", () => {
  it("lets an anomaly win, then a draft, else untouched", () => {
    expect(combineMeterStatus(null, null)).toBeNull();
    expect(combineMeterStatus("draft", null)).toBe("draft");
    expect(combineMeterStatus("draft", "anomaly")).toBe("anomaly");
  });
});

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
  it("scopes verified/draft/anomaly counts to the latest kỳ present, not a running total", () => {
    const utilities: Utility[] = [
      utility({
        id: "aug-verified",
        month: "2026-08",
        status: "VERIFIED",
        consumption: 100,
      }),
      utility({
        id: "sep-verified",
        month: "2026-09",
        status: "VERIFIED",
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
      verifiedCount: 1,
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
        status: "VERIFIED",
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
      verifiedCount: 0,
      draftCount: 0,
      anomalyCount: 0,
    });
  });
});
