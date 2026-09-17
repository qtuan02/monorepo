import { describe, expect, it } from "vitest";

import type { Room } from "~/types/room";
import type { Utility } from "~/types/utility";
import { buildMeterInputRooms } from "~/utils/meter-input-rooms";

function room(overrides: Partial<Room>): Room {
  return {
    id: "R-001",
    buildingId: "b1",
    name: "Phòng 101",
    floor: 1,
    area: 20,
    price: 2_000_000,
    status: "occupied",
    type: "single",
    tenant: "Nguyễn Văn A",
    lastUpdated: "01/09/2026",
    ...overrides,
  };
}

function utility(overrides: Partial<Utility>): Utility {
  return {
    id: "u1",
    buildingId: "b1",
    roomId: "R-001",
    roomName: "Phòng 101",
    month: "2026-08",
    type: "electricity",
    oldIndex: 1000,
    newIndex: 1120,
    consumption: 120,
    status: "VERIFIED",
    updatedAt: "2026-08-27T09:00:00Z",
    proofImages: [],
    ...overrides,
  };
}

describe("buildMeterInputRooms", () => {
  it("lists only occupied Phòng of the scoped Toà nhà", () => {
    const rooms = [
      room({ id: "R-001", buildingId: "b1", status: "occupied" }),
      room({ id: "R-002", buildingId: "b1", status: "available" }),
      room({ id: "R-003", buildingId: "b2", status: "occupied" }),
    ];

    const rows = buildMeterInputRooms("b1", "2026-09", rooms, []);

    expect(rows.map((r) => r.id)).toEqual(["R-001"]);
  });

  it("takes the last VERIFIED reading strictly before the kỳ as the baseline", () => {
    const rooms = [room({})];
    const utilities = [
      utility({
        id: "aug-d",
        month: "2026-08",
        type: "electricity",
        newIndex: 1120,
        consumption: 120,
      }),
      utility({
        id: "aug-n",
        month: "2026-08",
        type: "water",
        newIndex: 1008,
        consumption: 8,
      }),
    ];

    const [row] = buildMeterInputRooms("b1", "2026-09", rooms, utilities);

    expect(row).toEqual({
      id: "R-001",
      name: "Phòng 101",
      lastElectricity: 1120,
      lastWater: 1008,
      previousElectricityConsumption: 120,
      previousWaterConsumption: 8,
    });
  });

  it("never looks at a reading from the kỳ itself or later", () => {
    const rooms = [room({})];
    const utilities = [
      utility({
        id: "sep",
        month: "2026-09",
        type: "electricity",
        newIndex: 9999,
      }),
    ];

    const [row] = buildMeterInputRooms("b1", "2026-09", rooms, utilities);

    expect(row?.lastElectricity).toBe(0);
    expect(row?.previousElectricityConsumption).toBe(0);
  });

  it("defaults to 0 for a room with no prior reading", () => {
    const [row] = buildMeterInputRooms("b1", "2026-08", [room({})], []);

    expect(row).toEqual({
      id: "R-001",
      name: "Phòng 101",
      lastElectricity: 0,
      lastWater: 0,
      previousElectricityConsumption: 0,
      previousWaterConsumption: 0,
    });
  });
});
