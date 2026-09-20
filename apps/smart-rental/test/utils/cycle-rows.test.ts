import { describe, expect, it } from "vitest";

import type { Building } from "~/types/building";
import type { Contract } from "~/types/contract";
import type { Invoice } from "~/types/invoice";
import type { Room } from "~/types/room";
import type { Utility } from "~/types/utility";
import type { BuildingScope, World } from "~/types/world";
import type { WorldArrays } from "~/utils/world";
import {
  buildCycleDueDate,
  buildCycleLineItems,
  buildCycleRows,
  isCycleClosingDatePassed,
  isFutureCycle,
} from "~/utils/cycle-rows";
import { buildWorld } from "~/utils/world";

const today = new Date("2026-09-18T00:00:00.000Z");

const priceList = {
  electricityPricePerKwh: 3_500,
  waterPricePerM3: 15_000,
  serviceFee: 100_000,
};

const building: Building = {
  id: "b1",
  name: "Trọ Sinh Viên Xanh",
  address: "123 Ngũ Hành Sơn",
  collectionDay: 5,
  priceList,
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
    lastUpdated: "2026-09-01",
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
    startDate: "2026-01-01",
    endDate: "2026-12-31",
    status: "ACTIVE",
    renewalHistory: [],
    lastUpdated: "2026-09-01",
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
    approved: false,
    updatedAt: "2026-09-15T00:00:00.000Z",
    proofImages: [],
    ...overrides,
  };
}

/** World fixtures for `buildCycleRows` — seam 1 of ADR-0015: the util reads World, never a positional array. */
function makeWorld(
  overrides: Partial<WorldArrays> = {},
  scope: BuildingScope = "b1",
): World {
  return buildWorld(
    {
      buildings: [building],
      rooms: [],
      contracts: [],
      invoices: [],
      utilities: [],
      utilityOldIndexOverrides: [],
      tenants: [],
      complianceItems: [],
      expenses: [],
      supplierBills: [],
      notificationTemplates: [],
      sendLogs: [],
      landlordProfile: { name: "", phone: "", email: "" },
      ...overrides,
    },
    scope,
    today,
  );
}

describe("buildCycleRows", () => {
  it("EMPTY — a Phòng with no Hợp đồng hiệu lực is not lập-able", () => {
    const rows = buildCycleRows(
      makeWorld({ rooms: [room()] }),
      "b1",
      "2026-09",
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
      makeWorld({
        rooms: [room()],
        contracts: [contract({ status: "TERMINATED" })],
      }),
      "b1",
      "2026-09",
    );

    expect(rows[0]?.status).toBe("EMPTY");
  });

  it("MISSING — an occupied Phòng with no chỉ số of the kỳ yet", () => {
    const rows = buildCycleRows(
      makeWorld({ rooms: [room()], contracts: [contract()] }),
      "b1",
      "2026-09",
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
      makeWorld({
        rooms: [room()],
        contracts: [contract()],
        utilities: [utility({ type: "electricity" })],
      }),
      "b1",
      "2026-09",
    );

    expect(rows[0]?.status).toBe("MISSING");
  });

  it("READY — chỉ số cũ from kỳ trước, both readings in, not yet invoiced", () => {
    const rows = buildCycleRows(
      makeWorld({
        rooms: [room()],
        contracts: [contract()],
        utilities: [
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
      }),
      "b1",
      "2026-09",
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

  it("ANOMALY — consumption above 2× kỳ trước is flagged per đồng hồ, with a ratio reason, never READY", () => {
    const rows = buildCycleRows(
      makeWorld({
        rooms: [room()],
        contracts: [contract()],
        utilities: [
          // A reading's own `consumption` is trusted as-is when no "Sửa chỉ số
          // cũ" override applies (unchanged from before ticket #183) — kỳ
          // trước's is the ratio baseline, kỳ này's is what gets compared.
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
          // gấp 2,5 lần 100.
          utility({ id: "u-sep-d", type: "electricity", consumption: 250 }),
          // dưới 2×8 = 16 — không bất thường.
          utility({ id: "u-sep-n", type: "water", consumption: 9 }),
        ],
      }),
      "b1",
      "2026-09",
    );

    expect(rows[0]?.status).toBe("ANOMALY");
    // Only điện went over 2× — nước (9 < 2×8) never gets its own reason.
    expect(rows[0]?.electricityAnomalyReason).toBe("gấp 2,5 lần kỳ trước");
    expect(rows[0]?.waterAnomalyReason).toBeNull();
    expect(rows[0]?.reason).toBe("Điện gấp 2,5 lần kỳ trước");
  });

  it("a duyệt-ed reading no longer blocks the row — approved → READY (ticket #183)", () => {
    const rows = buildCycleRows(
      makeWorld({
        rooms: [room()],
        contracts: [contract()],
        utilities: [
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
          utility({
            id: "u-sep-d",
            type: "electricity",
            consumption: 250,
            approved: true,
          }),
          utility({ id: "u-sep-n", type: "water", consumption: 9 }),
        ],
      }),
      "b1",
      "2026-09",
    );

    expect(rows[0]?.status).toBe("READY");
    expect(rows[0]?.electricityAnomalyReason).toBeNull();
  });

  it("a Sửa chỉ số cũ override changes the displayed chỉ số cũ AND the recomputed tiêu thụ, one đồng hồ at a time", () => {
    const rows = buildCycleRows(
      makeWorld({
        rooms: [room()],
        contracts: [contract()],
        utilities: [
          utility({
            id: "u-aug-d",
            month: "2026-08",
            type: "electricity",
            newIndex: 1000,
          }),
          utility({
            id: "u-aug-n",
            month: "2026-08",
            type: "water",
            newIndex: 800,
          }),
          // điện's own consumption is IGNORED once corrected — only nước's is trusted as-is.
          utility({
            id: "u-sep-d",
            type: "electricity",
            newIndex: 1120,
            consumption: 9999,
          }),
          utility({
            id: "u-sep-n",
            type: "water",
            newIndex: 809,
            consumption: 9,
          }),
        ],
        // Only điện was corrected — nước still falls back to kỳ trước's reading.
        utilityOldIndexOverrides: [
          {
            id: "override-1",
            roomId: "R-001",
            type: "electricity",
            month: "2026-09",
            oldIndex: 1050,
            note: "",
            updatedAt: "2026-09-01T00:00:00.000Z",
          },
        ],
      }),
      "b1",
      "2026-09",
    );

    expect(rows[0]).toEqual(
      expect.objectContaining({
        oldElectricity: 1050,
        electricityConsumption: 70,
        oldWater: 800,
        waterConsumption: 9,
      }),
    );
  });

  it("prorates tiền phòng when Hợp đồng bắt đầu trong Kỳ, and carries the note", () => {
    const rows = buildCycleRows(
      makeWorld({
        rooms: [room()],
        contracts: [
          contract({ rentAmount: 3_000_000, startDate: "2026-09-21" }),
        ],
      }),
      "b1",
      "2026-09",
    );

    expect(rows[0]).toEqual(
      expect.objectContaining({
        rentAmount: 1_000_000,
        rentProrationNote: "10/30 ngày",
      }),
    );
  });

  it("bills the full tháng, no proration, when Hợp đồng started before the Kỳ", () => {
    const rows = buildCycleRows(
      makeWorld({
        rooms: [room()],
        contracts: [
          contract({ rentAmount: 3_000_000, startDate: "2026-01-01" }),
        ],
      }),
      "b1",
      "2026-09",
    );

    expect(rows[0]).toEqual(
      expect.objectContaining({
        rentAmount: 3_000_000,
        rentProrationNote: null,
      }),
    );
  });

  it("INVOICED — a Hoá đơn already covers this (contract, kỳ), wins over READY", () => {
    const rows = buildCycleRows(
      makeWorld({
        rooms: [room()],
        contracts: [contract()],
        utilities: [
          utility({ id: "u-sep-d", type: "electricity" }),
          utility({ id: "u-sep-n", type: "water" }),
        ],
        invoices: [
          {
            buildingId: "b1",
            contractId: "C001",
            billingMonth: "2026-09",
          } as Invoice,
        ],
      }),
      "b1",
      "2026-09",
    );

    expect(rows[0]?.status).toBe("INVOICED");
  });

  it("only rooms of the scoped Toà nhà come back", () => {
    // World built at scope `null` so both Toà nhà's rooms are present —
    // `buildCycleRows` must filter to `buildingId` itself.
    const rows = buildCycleRows(
      makeWorld(
        {
          rooms: [
            room({ id: "R-001", buildingId: "b1" }),
            room({ id: "R-002", buildingId: "b2" }),
          ],
        },
        null,
      ),
      "b1",
      "2026-09",
    );

    expect(rows.map((r) => r.roomId)).toEqual(["R-001"]);
  });
});

describe("buildCycleLineItems", () => {
  it("bills đủ dòng: tiền phòng + điện/nước theo tiêu thụ × Bảng giá + dịch vụ cố định", () => {
    const lineItems = buildCycleLineItems(
      { rentAmount: 2_700_000, startDate: "2026-01-01" },
      { priceList },
      120,
      8,
      "2026-09",
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

  it("prorates tiền phòng when Hợp đồng bắt đầu trong Kỳ, with the note in the description", () => {
    const lineItems = buildCycleLineItems(
      { rentAmount: 3_000_000, startDate: "2026-09-21" },
      { priceList },
      0,
      0,
      "2026-09",
    );

    expect(lineItems[0]).toEqual({
      type: "RENT",
      description: "Tiền phòng (10/30 ngày)",
      quantity: 1,
      unitPrice: 1_000_000,
      amount: 1_000_000,
    });
  });
});

describe("buildCycleDueDate", () => {
  it("hạn là Ngày thu của THÁNG KẾ TIẾP kỳ, không phải cùng tháng (ADR-0013)", () => {
    expect(buildCycleDueDate({ collectionDay: 5 }, "2026-09")).toBe(
      "2026-10-05",
    );
  });

  it("clamps a ngày thu past the month AFTER the kỳ's length instead of rolling further", () => {
    expect(buildCycleDueDate({ collectionDay: 31 }, "2026-01")).toBe(
      "2026-02-28",
    );
    expect(buildCycleDueDate({ collectionDay: 31 }, "2026-03")).toBe(
      "2026-04-30",
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

describe("isFutureCycle", () => {
  it("is false for the current month and every past one", () => {
    expect(isFutureCycle("2026-09", today)).toBe(false);
    expect(isFutureCycle("2026-08", today)).toBe(false);
  });

  it("is true for a month after the current one", () => {
    expect(isFutureCycle("2026-10", today)).toBe(true);
  });
});
