import { describe, expect, it } from "vitest";

import type { Building } from "~/types/building";
import type { Contract } from "~/types/contract";
import type { Room } from "~/types/room";
import type { Utility } from "~/types/utility";
import {
  buildCycleProgressSummary,
  resolveNextCycleAction,
} from "~/utils/cycle-progress";

const priceList = {
  electricityPricePerKwh: 3_500,
  waterPricePerM3: 15_000,
  serviceFee: 100_000,
};

const buildings: Pick<Building, "id" | "priceList">[] = [
  { id: "b1", priceList },
  { id: "b2", priceList },
];

function room(overrides: Partial<Room> = {}): Room {
  return {
    id: "R1",
    buildingId: "b1",
    name: "Phòng 101",
    floor: 1,
    area: 20,
    price: 3_000_000,
    status: "occupied",
    type: "single",
    tenant: "Nguyễn Văn A",
    lastUpdated: "18/09/2026",
    ...overrides,
  };
}

function contract(overrides: Partial<Contract> = {}): Contract {
  return {
    id: "C1",
    buildingId: "b1",
    roomId: "R1",
    tenantId: "T1",
    contractNumber: "HĐ-001",
    tenant: "Nguyễn Văn A",
    room: "Phòng 101",
    floor: 1,
    rentAmount: 3_000_000,
    depositAmount: 3_000_000,
    depositStatus: "HELD",
    depositReturnedAmount: 0,
    noticeDays: 30,
    startDate: "01/01/2026",
    endDate: "01/01/2027",
    status: "ACTIVE",
    renewalHistory: [],
    lastUpdated: "18/09/2026",
    ...overrides,
  };
}

function utility(overrides: Partial<Utility> = {}): Utility {
  return {
    id: "u1",
    buildingId: "b1",
    roomId: "R1",
    roomName: "Phòng 101",
    month: "2026-09",
    type: "electricity",
    oldIndex: 100,
    newIndex: 150,
    consumption: 50,
    status: "DRAFT",
    approved: false,
    updatedAt: "2026-09-10T00:00:00.000Z",
    proofImages: [],
    ...overrides,
  };
}

describe("buildCycleProgressSummary", () => {
  it("counts a fully-entered Phòng as entered, and an unoccupied one out of total", () => {
    const progress = buildCycleProgressSummary(
      buildings,
      "2026-09",
      [
        room({ id: "R1", buildingId: "b1" }),
        room({ id: "R2", buildingId: "b1", status: "available", tenant: null }),
      ],
      [contract({ id: "C1", roomId: "R1" })],
      [
        utility({ roomId: "R1", type: "electricity" }),
        utility({ id: "u2", roomId: "R1", type: "water" }),
      ],
      [],
    );

    expect(progress).toMatchObject({ entered: 1, total: 1, anomalyCount: 0 });
  });

  it("sums across every Toà nhà when given more than one", () => {
    const progress = buildCycleProgressSummary(
      buildings,
      "2026-09",
      [
        room({ id: "R1", buildingId: "b1" }),
        room({ id: "R2", buildingId: "b2" }),
      ],
      [
        contract({ id: "C1", buildingId: "b1", roomId: "R1" }),
        contract({ id: "C2", buildingId: "b2", roomId: "R2" }),
      ],
      // Only R1 (b1) has both readings; R2 (b2) has none yet.
      [
        utility({ roomId: "R1", type: "electricity" }),
        utility({ id: "u2", roomId: "R1", type: "water" }),
      ],
      [],
    );

    expect(progress).toEqual({
      month: "2026-09",
      entered: 1,
      total: 2,
      anomalyCount: 0,
      allInvoiced: false,
    });
  });

  it("is allInvoiced only once every occupied Phòng's Kỳ has a Hoá đơn", () => {
    const progress = buildCycleProgressSummary(
      [{ id: "b1", priceList }],
      "2026-09",
      [room({ id: "R1", buildingId: "b1" })],
      [contract({ id: "C1", roomId: "R1" })],
      [
        utility({ roomId: "R1", type: "electricity" }),
        utility({ id: "u2", roomId: "R1", type: "water" }),
      ],
      [{ contractId: "C1", billingMonth: "2026-09" }],
    );

    expect(progress.allInvoiced).toBe(true);
  });
});

describe("resolveNextCycleAction", () => {
  const today = new Date("2026-09-18T00:00:00.000Z");
  const pastCycleEnd = new Date("2026-09-30T00:00:00.000Z");

  it("returns null when there is nothing occupied to report", () => {
    expect(
      resolveNextCycleAction(
        {
          month: "2026-09",
          entered: 0,
          total: 0,
          anomalyCount: 0,
          allInvoiced: false,
        },
        today,
      ),
    ).toBeNull();
  });

  it("asks to nhập chỉ số while something is still missing", () => {
    const action = resolveNextCycleAction(
      {
        month: "2026-09",
        entered: 1,
        total: 2,
        anomalyCount: 0,
        allInvoiced: false,
      },
      today,
    );

    expect(action).toEqual({
      label: "Nhập chỉ số Kỳ 09/2026",
      month: "2026-09",
    });
  });

  it("asks to lập Đợt once everything is entered and the ngày chốt has passed", () => {
    const action = resolveNextCycleAction(
      {
        month: "2026-09",
        entered: 2,
        total: 2,
        anomalyCount: 0,
        allInvoiced: false,
      },
      pastCycleEnd,
    );

    expect(action).toEqual({ label: "Lập Đợt hoá đơn", month: "2026-09" });
  });

  it("stays null before the ngày chốt, even with everything entered", () => {
    expect(
      resolveNextCycleAction(
        {
          month: "2026-09",
          entered: 2,
          total: 2,
          anomalyCount: 0,
          allInvoiced: false,
        },
        today,
      ),
    ).toBeNull();
  });

  it("is null once every Phòng is already invoiced", () => {
    expect(
      resolveNextCycleAction(
        {
          month: "2026-09",
          entered: 2,
          total: 2,
          anomalyCount: 0,
          allInvoiced: true,
        },
        pastCycleEnd,
      ),
    ).toBeNull();
  });
});
