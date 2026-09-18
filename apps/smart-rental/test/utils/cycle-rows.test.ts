import { describe, expect, it } from "vitest";

import type { PriceList } from "~/types/building";
import type { Contract } from "~/types/contract";
import type { Invoice } from "~/types/invoice";
import type { Room } from "~/types/room";
import type { Utility } from "~/types/utility";
import {
  buildCycleDueDate,
  buildCycleLineItems,
  buildCycleRows,
  isCycleClosingDatePassed,
} from "~/utils/cycle-rows";

const today = new Date("2026-09-18T00:00:00.000Z");

const priceList: PriceList = {
  electricityPricePerKwh: 3_500,
  waterPricePerM3: 15_000,
  serviceFee: 100_000,
};

function room(overrides: Partial<Room> = {}): Room {
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

function contract(overrides: Partial<Contract> = {}): Contract {
  return {
    id: "C001",
    buildingId: "b1",
    roomId: "R-001",
    tenantId: "T001",
    contractNumber: "HĐ-001",
    tenant: "Nguyễn Văn A",
    room: "Phòng 101",
    floor: 1,
    rentAmount: 2_700_000,
    depositAmount: 2_700_000,
    depositStatus: "HELD",
    depositReturnedAmount: 0,
    noticeDays: 30,
    startDate: "01/01/2026",
    endDate: "31/12/2026",
    status: "ACTIVE",
    renewalHistory: [],
    lastUpdated: "01/09/2026",
    ...overrides,
  };
}

function utility(overrides: Partial<Utility> = {}): Utility {
  return {
    id: "u-1",
    buildingId: "b1",
    roomId: "R-001",
    roomName: "Phòng 101",
    month: "2026-09",
    type: "electricity",
    oldIndex: 1000,
    newIndex: 1120,
    consumption: 120,
    status: "DRAFT",
    updatedAt: "2026-09-15T00:00:00.000Z",
    proofImages: [],
    ...overrides,
  };
}

describe("buildCycleRows", () => {
  it("EMPTY — a Phòng with no Hợp đồng hiệu lực is not lập-able", () => {
    const rows = buildCycleRows(
      "b1",
      "2026-09",
      [room()],
      [],
      [],
      [],
      priceList,
      today,
    );

    expect(rows).toEqual([
      expect.objectContaining({
        roomId: "R-001",
        contractId: null,
        status: "EMPTY",
        totalAmount: 0,
      }),
    ]);
  });

  it("EMPTY — a Hợp đồng that is not currently hiệu lực counts the room as vacant", () => {
    const rows = buildCycleRows(
      "b1",
      "2026-09",
      [room()],
      [contract({ status: "TERMINATED" })],
      [],
      [],
      priceList,
      today,
    );

    expect(rows[0]?.status).toBe("EMPTY");
  });

  it("MISSING — an occupied Phòng with no chỉ số of the kỳ yet", () => {
    const rows = buildCycleRows(
      "b1",
      "2026-09",
      [room()],
      [contract()],
      [],
      [],
      priceList,
      today,
    );

    expect(rows[0]).toEqual(
      expect.objectContaining({
        status: "MISSING",
        newElectricity: null,
        newWater: null,
      }),
    );
  });

  it("MISSING — only one of the two chỉ số of the kỳ has been entered", () => {
    const rows = buildCycleRows(
      "b1",
      "2026-09",
      [room()],
      [contract()],
      [utility({ type: "electricity" })],
      [],
      priceList,
      today,
    );

    expect(rows[0]?.status).toBe("MISSING");
  });

  it("READY — chỉ số cũ from kỳ trước, both readings in, not yet invoiced", () => {
    const rows = buildCycleRows(
      "b1",
      "2026-09",
      [room()],
      [contract()],
      [
        utility({
          id: "u-aug-d",
          month: "2026-08",
          type: "electricity",
          newIndex: 1000,
          consumption: 100,
        }),
        utility({
          id: "u-aug-n",
          month: "2026-08",
          type: "water",
          newIndex: 800,
          consumption: 8,
        }),
        utility({
          id: "u-sep-d",
          type: "electricity",
          oldIndex: 1000,
          newIndex: 1120,
          consumption: 120,
        }),
        utility({
          id: "u-sep-n",
          type: "water",
          oldIndex: 800,
          newIndex: 809,
          consumption: 9,
        }),
      ],
      [],
      priceList,
      today,
    );

    expect(rows[0]).toEqual(
      expect.objectContaining({
        status: "READY",
        oldElectricity: 1000,
        oldWater: 800,
        newElectricity: 1120,
        newWater: 809,
        electricityConsumption: 120,
        waterConsumption: 9,
        electricAmount: 120 * priceList.electricityPricePerKwh,
        waterAmount: 9 * priceList.waterPricePerM3,
        totalAmount:
          2_700_000 +
          120 * priceList.electricityPricePerKwh +
          9 * priceList.waterPricePerM3 +
          priceList.serviceFee,
      }),
    );
  });

  it("ANOMALY — consumption above 2× kỳ trước is flagged, never READY", () => {
    const rows = buildCycleRows(
      "b1",
      "2026-09",
      [room()],
      [contract()],
      [
        utility({
          id: "u-aug-d",
          month: "2026-08",
          type: "electricity",
          consumption: 100,
        }),
        utility({
          id: "u-aug-n",
          month: "2026-08",
          type: "water",
          consumption: 8,
        }),
        utility({ id: "u-sep-d", type: "electricity", consumption: 250 }),
        utility({ id: "u-sep-n", type: "water", consumption: 9 }),
      ],
      [],
      priceList,
      today,
    );

    expect(rows[0]?.status).toBe("ANOMALY");
  });

  it("INVOICED — a Hoá đơn already covers this (contract, kỳ), wins over READY", () => {
    const rows = buildCycleRows(
      "b1",
      "2026-09",
      [room()],
      [contract()],
      [
        utility({ id: "u-sep-d", type: "electricity" }),
        utility({ id: "u-sep-n", type: "water" }),
      ],
      [{ contractId: "C001", billingMonth: "2026-09" } as Invoice],
      priceList,
      today,
    );

    expect(rows[0]?.status).toBe("INVOICED");
  });

  it("only rooms of the scoped Toà nhà come back", () => {
    const rows = buildCycleRows(
      "b1",
      "2026-09",
      [
        room({ id: "R-001", buildingId: "b1" }),
        room({ id: "R-002", buildingId: "b2" }),
      ],
      [],
      [],
      [],
      priceList,
      today,
    );

    expect(rows.map((r) => r.roomId)).toEqual(["R-001"]);
  });
});

describe("buildCycleLineItems", () => {
  it("bills đủ dòng: tiền phòng + điện/nước theo tiêu thụ × Bảng giá + dịch vụ cố định", () => {
    const lineItems = buildCycleLineItems(
      { rentAmount: 2_700_000 },
      { priceList },
      120,
      8,
    );

    expect(lineItems).toEqual([
      {
        type: "RENT",
        description: "Tiền phòng",
        quantity: 1,
        unitPrice: 2_700_000,
        amount: 2_700_000,
      },
      {
        type: "ELECTRIC",
        description: "Tiền điện",
        quantity: 120,
        unitPrice: 3_500,
        amount: 420_000,
      },
      {
        type: "WATER",
        description: "Tiền nước",
        quantity: 8,
        unitPrice: 15_000,
        amount: 120_000,
      },
      {
        type: "SERVICE",
        description: "Phí dịch vụ",
        quantity: 1,
        unitPrice: 100_000,
        amount: 100_000,
      },
    ]);
  });
});

describe("buildCycleDueDate", () => {
  it("hạn là Ngày thu của THÁNG KẾ TIẾP kỳ, không phải cùng tháng (ADR-0013)", () => {
    expect(buildCycleDueDate({ collectionDay: 5 }, "2026-09")).toBe(
      "05/10/2026",
    );
  });

  it("clamps a ngày thu past the month AFTER the kỳ's length instead of rolling further", () => {
    expect(buildCycleDueDate({ collectionDay: 31 }, "2026-01")).toBe(
      "28/02/2026",
    );
    expect(buildCycleDueDate({ collectionDay: 31 }, "2026-03")).toBe(
      "30/04/2026",
    );
  });
});

describe("isCycleClosingDatePassed", () => {
  it("is false before the last day of the kỳ's own month", () => {
    expect(isCycleClosingDatePassed("2026-09", new Date("2026-09-18"))).toBe(
      false,
    );
  });

  it("is true on/after the last day of the kỳ's own month", () => {
    expect(isCycleClosingDatePassed("2026-09", new Date("2026-09-30"))).toBe(
      true,
    );
    expect(isCycleClosingDatePassed("2026-09", new Date("2026-10-01"))).toBe(
      true,
    );
  });
});
