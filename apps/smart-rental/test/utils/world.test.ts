import { describe, expect, it } from "vitest";

import type { Building } from "~/types/building";
import type { Contract } from "~/types/contract";
import type { Invoice } from "~/types/invoice";
import type { Room } from "~/types/room";
import type { Tenant } from "~/types/tenant";
import type { Utility } from "~/types/utility";
import type { WorldArrays } from "~/utils/world";
import { buildWorld } from "~/utils/world";

const today = new Date("2026-09-18T00:00:00.000Z");

const priceList = {
  electricityPricePerKwh: 3_500,
  waterPricePerM3: 15_000,
  serviceFee: 100_000,
};

function building(overrides: Partial<Building> = {}): Building {
  return {
    id: "b1",
    name: "Trọ b1",
    address: "123",
    collectionDay: 5,
    priceList,
    ...overrides,
  };
}

function room(overrides: Partial<Room> = {}): Room {
  return {
    id: "R1",
    buildingId: "b1",
    name: "Phòng 101",
    floor: 1,
    area: 20,
    price: 2_000_000,
    status: "occupied",
    type: "single",
    lastUpdated: "01/09/2026",
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

function tenant(overrides: Partial<Tenant> = {}): Tenant {
  return {
    id: "T1",
    buildingId: "b1",
    name: "Nguyễn Văn A",
    phone: "0900000001",
    email: "a@example.com",
    idNumber: "079000000001",
    gender: "male",
    ...overrides,
  };
}

function invoice(overrides: Partial<Invoice> = {}): Invoice {
  return {
    id: "I1",
    buildingId: "b1",
    contractId: "C1",
    invoiceNumber: "HÓA-001",
    tenant: "Nguyễn Văn A",
    room: "Phòng 101",
    floor: 1,
    amount: 1_000_000,
    lineItems: [],
    payments: [],
    paidAmount: 0,
    reminders: [],
    billingMonth: "2026-09",
    month: "09/2026",
    dueDate: "05/09/2026",
    status: "UNPAID",
    paymentDate: null,
    lastUpdated: "01/09/2026",
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

function makeArrays(overrides: Partial<WorldArrays> = {}): WorldArrays {
  return {
    buildings: [],
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
  };
}

describe("buildWorld — scope", () => {
  it("scope null gộp mọi Toà nhà — every array comes back unfiltered", () => {
    const world = buildWorld(
      makeArrays({
        buildings: [building({ id: "b1" }), building({ id: "b2" })],
        rooms: [
          room({ id: "R1", buildingId: "b1" }),
          room({ id: "R2", buildingId: "b2" }),
        ],
      }),
      null,
      today,
    );

    expect(world.buildings.map((b) => b.id)).toEqual(["b1", "b2"]);
    expect(world.rooms.map((r) => r.id)).toEqual(["R1", "R2"]);
  });

  it("scope null never hands back the Mock's own array reference — a queryFn's data must not equal a mutationFn's in-place write (buildings-rooms.e2e.ts regression)", () => {
    const rawBuildings = [building({ id: "b1" })];
    const rawRooms = [room({ id: "R1" })];
    const world = buildWorld(
      makeArrays({ buildings: rawBuildings, rooms: rawRooms }),
      null,
      today,
    );

    expect(world.buildings).not.toBe(rawBuildings);
    expect(world.rooms).not.toBe(rawRooms);
  });

  it("scope một Toà nhà lọc Toà nhà theo id và mọi entity khác theo buildingId", () => {
    const world = buildWorld(
      makeArrays({
        buildings: [building({ id: "b1" }), building({ id: "b2" })],
        rooms: [
          room({ id: "R1", buildingId: "b1" }),
          room({ id: "R2", buildingId: "b2" }),
        ],
        contracts: [
          contract({ id: "C1", buildingId: "b1" }),
          contract({ id: "C2", buildingId: "b2" }),
        ],
        invoices: [
          invoice({ id: "I1", buildingId: "b1" }),
          invoice({ id: "I2", buildingId: "b2" }),
        ],
        utilities: [
          utility({ id: "u1", buildingId: "b1" }),
          utility({ id: "u2", buildingId: "b2" }),
        ],
        expenses: [
          {
            id: "e1",
            buildingId: "b1",
            category: "",
            amount: 0,
            expenseDate: "",
          },
          {
            id: "e2",
            buildingId: "b2",
            category: "",
            amount: 0,
            expenseDate: "",
          },
        ],
        supplierBills: [
          {
            id: "sb1",
            buildingId: "b1",
            type: "electricity",
            supplierName: "",
            billingPeriod: "",
            totalAmount: 0,
          },
          {
            id: "sb2",
            buildingId: "b2",
            type: "electricity",
            supplierName: "",
            billingPeriod: "",
            totalAmount: 0,
          },
        ],
      }),
      "b1",
      today,
    );

    expect(world.buildings.map((b) => b.id)).toEqual(["b1"]);
    expect(world.rooms.map((r) => r.id)).toEqual(["R1"]);
    expect(world.contracts.map((c) => c.id)).toEqual(["C1"]);
    expect(world.invoices.map((i) => i.id)).toEqual(["I1"]);
    expect(world.utilities.map((u) => u.id)).toEqual(["u1"]);
    expect(world.expenses.map((e) => e.id)).toEqual(["e1"]);
    expect(world.supplierBills.map((b) => b.id)).toEqual(["sb1"]);
  });

  it("notificationTemplates/sendLogs/landlordProfile pass through unfiltered — no buildingId to scope by", () => {
    const world = buildWorld(
      makeArrays({
        notificationTemplates: [
          {
            id: "T1",
            name: "",
            channel: "email",
            description: "",
            preview: "",
          },
        ],
        sendLogs: [
          {
            id: "SL1",
            tenant: "",
            template: "",
            channel: "email",
            status: "sent",
            sentDate: "",
            recipient: "",
          },
        ],
        landlordProfile: { name: "Chủ trọ", phone: "0900000000", email: "" },
      }),
      "b1",
      today,
    );

    expect(world.notificationTemplates.map((t) => t.id)).toEqual(["T1"]);
    expect(world.sendLogs.map((l) => l.id)).toEqual(["SL1"]);
    expect(world.landlordProfile.name).toBe("Chủ trọ");
  });

  it('"" is never a scope (typecheck)', () => {
    // @ts-expect-error — BuildingScope's `""` is a bug, never "mọi Toà nhà"; use `null`.
    buildWorld(makeArrays(), "");
  });
});

describe("buildWorld — derived status", () => {
  it("suy Hoá đơn OVERDUE khi quá hạn thu, dù trạng thái Mock ghi UNPAID", () => {
    const world = buildWorld(
      makeArrays({
        invoices: [invoice({ dueDate: "05/09/2026", status: "UNPAID" })],
      }),
      "b1",
      today,
    );

    expect(world.invoices[0]?.status).toBe("OVERDUE");
  });

  it("suy Hoá đơn PARTIAL khi đã trả một phần và chưa tới hạn", () => {
    const world = buildWorld(
      makeArrays({
        invoices: [
          invoice({
            dueDate: "30/09/2026",
            amount: 1_000_000,
            paidAmount: 400_000,
            status: "UNPAID",
          }),
        ],
      }),
      "b1",
      today,
    );

    expect(world.invoices[0]?.status).toBe("PARTIAL");
  });

  it("suy Hợp đồng EXPIRING trong cửa sổ 30 ngày trước ngày kết thúc", () => {
    const world = buildWorld(
      makeArrays({
        contracts: [contract({ endDate: "01/10/2026", status: "ACTIVE" })],
      }),
      "b1",
      today,
    );

    expect(world.contracts[0]?.status).toBe("EXPIRING");
  });

  it("gộp sẵn Chỉ số bất thường vào anomalousUtilities", () => {
    const world = buildWorld(
      makeArrays({
        utilities: [
          utility({
            id: "u-aug",
            month: "2026-08",
            consumption: 100,
            status: "FINALIZED",
          }),
          // gấp 2,5 lần kỳ trước.
          utility({ id: "u-sep", month: "2026-09", consumption: 250 }),
        ],
      }),
      "b1",
      today,
    );

    expect(world.anomalousUtilities.map((u) => u.id)).toEqual(["u-sep"]);
  });
});

describe("buildWorld — joined views (ADR-0015 §2)", () => {
  it("RoomView.tenant is the name off the Phòng's live Hợp đồng", () => {
    const world = buildWorld(
      makeArrays({
        rooms: [room({ id: "R1" })],
        contracts: [contract({ roomId: "R1", status: "ACTIVE" })],
      }),
      "b1",
      today,
    );

    expect(world.rooms[0]?.tenant).toBe("Nguyễn Văn A");
  });

  it("RoomView.tenant is null once its Hợp đồng is no longer live (Thanh lý)", () => {
    const world = buildWorld(
      makeArrays({
        rooms: [room({ id: "R1" })],
        contracts: [
          contract({
            roomId: "R1",
            status: "TERMINATED",
            terminatedAt: "01/09/2026",
          }),
        ],
      }),
      "b1",
      today,
    );

    expect(world.rooms[0]?.tenant).toBeNull();
  });

  it("TenantView.contractEnd is the newest live Hợp đồng's endDate", () => {
    const world = buildWorld(
      makeArrays({
        tenants: [tenant({ id: "T1" })],
        contracts: [
          contract({ id: "C1", tenantId: "T1", endDate: "31/10/2026" }),
        ],
      }),
      "b1",
      today,
    );

    expect(world.tenants[0]?.contractEnd).toBe("31/10/2026");
    expect(world.tenants[0]?.room).toBe("Phòng 101");
  });

  it("TenantView falls back to the most recently ended Hợp đồng once none is live", () => {
    const world = buildWorld(
      makeArrays({
        tenants: [tenant({ id: "T1" })],
        contracts: [
          contract({
            id: "C1",
            tenantId: "T1",
            status: "TERMINATED",
            endDate: "01/06/2026",
          }),
        ],
      }),
      "b1",
      today,
    );

    expect(world.tenants[0]?.contractEnd).toBe("01/06/2026");
  });

  it("TenantView is the placeholder blanks for a Người thuê with no Hợp đồng at all", () => {
    const world = buildWorld(
      makeArrays({ tenants: [tenant({ id: "T1" })] }),
      "b1",
      today,
    );

    expect(world.tenants[0]).toMatchObject({
      room: "—",
      floor: 0,
      rentAmount: 0,
      depositAmount: 0,
      moveInDate: "—",
      contractEnd: "—",
    });
  });

  it("BuildingView's four figures are counted off its own Phòng and Hợp đồng hiệu lực", () => {
    const world = buildWorld(
      makeArrays({
        buildings: [building({ id: "b1" })],
        rooms: [
          room({ id: "R1" }),
          room({ id: "R2" }),
          room({ id: "R3" }),
          room({ id: "R4" }),
        ],
        contracts: [
          contract({ id: "C1", roomId: "R1", status: "ACTIVE" }),
          contract({ id: "C2", roomId: "R2", status: "EXPIRING" }),
        ],
      }),
      "b1",
      today,
    );

    expect(world.buildings[0]).toMatchObject({
      totalRooms: 4,
      activeContracts: 2,
      availableRooms: 2,
      occupancyRate: 50,
    });
  });
});
