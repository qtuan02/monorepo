import { describe, expect, it } from "vitest";

import { mockBuildings } from "~/constants/mock/buildings";
import { getBuildingStats } from "~/features/buildings/utils/building-stats";

const base = {
  id: "b",
  name: "n",
  address: "a",
  collectionDay: 5,
  priceList: {
    electricityPricePerKwh: 3500,
    waterPricePerM3: 15000,
    serviceFee: 0,
  },
};

describe("getBuildingStats", () => {
  it("derives the free rooms and the occupancy from what the Mock has", () => {
    expect(
      getBuildingStats({ ...base, totalRooms: 15, activeContracts: 12 }),
    ).toEqual({
      totalRooms: 15,
      activeContracts: 12,
      availableRooms: 3,
      occupancyRate: 80,
    });
  });

  it("keeps explicit figures over derived ones", () => {
    expect(
      getBuildingStats({
        ...base,
        totalRooms: 10,
        activeContracts: 5,
        availableRooms: 2,
        occupancyRate: 75,
      }),
    ).toMatchObject({ availableRooms: 2, occupancyRate: 75 });
  });

  it("is all zeros for a Toà nhà with no Phòng yet", () => {
    expect(getBuildingStats(base)).toEqual({
      totalRooms: 0,
      activeContracts: 0,
      availableRooms: 0,
      occupancyRate: 0,
    });
  });

  it("carries a real activeContracts for every Mock building, not the totalRooms-as-empty default", () => {
    // Regression guard: mockBuildings once shipped `totalRooms` alone, so every
    // card silently read 0% occupied and "Phòng trống" as the whole building.
    for (const building of mockBuildings) {
      expect(getBuildingStats(building).occupancyRate).toBeGreaterThan(0);
    }
  });
});
