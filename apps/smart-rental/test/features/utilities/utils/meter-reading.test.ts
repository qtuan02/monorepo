import { describe, expect, it } from "vitest";

import type { Utility } from "~/types/utility";
import {
  calculateUtilityStats,
  combineMeterStatus,
  estimateUtilityCost,
  readMeter,
} from "~/features/utilities/utils/meter-reading";

const utility = (status: Utility["status"]): Utility => ({
  id: status,
  buildingId: "b1",
  roomId: "room-001",
  roomName: "Phòng 101",
  month: "2024-04",
  type: "water",
  oldIndex: 1,
  newIndex: 2,
  consumption: 1,
  status,
  updatedAt: "2024-04-25T10:30:00Z",
  proofImages: [],
});

describe("readMeter", () => {
  it("is empty until something is typed", () => {
    expect(readMeter(1250, "")).toEqual({ consumption: null, status: null });
    expect(readMeter(1250, "  ")).toEqual({ consumption: null, status: null });
  });

  it("consumption is new − old, as a draft", () => {
    expect(readMeter(1250, "1300")).toEqual({
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
  it("prices điện at 3.500 ₫/kWh and nước at 8.000 ₫/m³", () => {
    expect(estimateUtilityCost("electricity", 150)).toBe(525000);
    expect(estimateUtilityCost("water", 7)).toBe(56000);
  });
});

describe("calculateUtilityStats", () => {
  it("counts readings and drafts — anomaly is never a persisted status (ADR-0012)", () => {
    expect(
      calculateUtilityStats([
        utility("VERIFIED"),
        utility("DRAFT"),
        utility("DRAFT"),
      ]),
    ).toEqual({ totalReadings: 3, anomalyCount: 0, pendingVerifyCount: 2 });
  });
});
