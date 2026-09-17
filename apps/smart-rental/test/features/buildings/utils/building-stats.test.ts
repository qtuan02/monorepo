import { describe, expect, it } from "vitest";

import { getBuildingStats } from "~/features/buildings/utils/building-stats";

const base = {
  id: "b",
  name: "n",
  address: "a",
  collectionDay: 5,
  priceList: { electricityPricePerKwh: 3500, waterPricePerM3: 15000, serviceFee: 0 },
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
});
