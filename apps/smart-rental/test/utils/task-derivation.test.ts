import { describe, expect, it } from "vitest";

import type { Building } from "~/types/building";
import type { ComplianceItem } from "~/types/compliance";
import type { Contract } from "~/types/contract";
import type { Invoice } from "~/types/invoice";
import type { Tenant } from "~/types/tenant";
import type { Utility } from "~/types/utility";
import { deriveTasks } from "~/utils/task-derivation";

const today = new Date("2026-09-18T00:00:00.000Z");
// Past the ngày chốt (cuối tháng) of the current Kỳ — the only moment
// batch_pending is allowed to fire (ADR-0013).
const pastCycleEnd = new Date("2026-09-30T00:00:00.000Z");

const building: Building = {
  id: "b1",
  name: "Trọ Sinh Viên Xanh",
  address: "123 Ngũ Hành Sơn",
  collectionDay: 5,
  priceList: {
    electricityPricePerKwh: 3500,
    waterPricePerM3: 15000,
    serviceFee: 100000,
  },
};

const tenant: Tenant = {
  id: "T001",
  buildingId: "b1",
  name: "Nguyễn Văn A",
  phone: "0900000000",
  email: "a@example.com",
  room: "Phòng 101",
  floor: 1,
  rentAmount: 2_000_000,
  depositAmount: 2_000_000,
  moveInDate: "01/01/2026",
  contractEnd: "31/12/2027",
  idNumber: "012345678",
  gender: "male",
};

const contract: Contract = {
  id: "C001",
  buildingId: "b1",
  roomId: "R1",
  tenantId: "T001",
  contractNumber: "HĐ-001",
  tenant: "Nguyễn Văn A",
  room: "Phòng 101",
  floor: 1,
  rentAmount: 2_000_000,
  depositAmount: 2_000_000,
  depositStatus: "HELD",
  depositReturnedAmount: 0,
  noticeDays: 30,
  startDate: "01/01/2026",
  endDate: "05/10/2026", // within the 30-day EXPIRING window of "today"
  status: "ACTIVE",
  renewalHistory: [],
  lastUpdated: "01/09/2026",
};

const overdueInvoice: Invoice = {
  id: "I001",
  buildingId: "b1",
  contractId: "C001",
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
  lastUpdated: "17/09/2026",
};

const anomalousUtility: Utility = {
  id: "u-sep",
  buildingId: "b1",
  roomId: "R1",
  roomName: "Phòng 101",
  month: "2026-09",
  type: "electricity",
  oldIndex: 1000,
  newIndex: 1300,
  consumption: 300,
  status: "DRAFT",
  approved: false,
  updatedAt: "2026-09-15T00:00:00.000Z",
  proofImages: [],
};
const previousUtility: Utility = {
  ...anomalousUtility,
  id: "u-aug",
  month: "2026-08",
  oldIndex: 900,
  newIndex: 1000,
  consumption: 100,
  status: "FINALIZED",
};

const noComplianceItems: ComplianceItem[] = [];

function derive(
  overrides: Partial<Parameters<typeof deriveTasks>[0]> = {},
  todayOverride: Date = today,
) {
  return deriveTasks(
    {
      contracts: [contract],
      invoices: [overdueInvoice],
      utilities: [previousUtility, anomalousUtility],
      tenants: [tenant],
      complianceItems: noComplianceItems,
      buildings: [building],
      ...overrides,
    },
    todayOverride,
  );
}

describe("deriveTasks", () => {
  it("adds an invoice_overdue task pointing at the existing invoice", () => {
    const tasks = derive();
    const task = tasks.find((t) => t.type === "invoice_overdue");

    expect(task).toMatchObject({ relatedEntity: "invoice", relatedId: "I001" });
  });

  it("adds a contract_expiring task pointing at the existing contract", () => {
    const tasks = derive();
    const task = tasks.find((t) => t.type === "contract_expiring");

    expect(task).toMatchObject({
      relatedEntity: "contract",
      relatedId: "C001",
    });
  });

  it("adds a utility_anomaly task pointing at the Kỳ screen's own row", () => {
    const tasks = derive();
    const task = tasks.find((t) => t.type === "utility_anomaly");

    // relatedId is the Kỳ's own YYYY-MM — the màn Kỳ row where a bất thường
    // is actually duyệt-able, not the read-only /utilities/:id (spec #179
    // §"Hôm nay").
    expect(task).toMatchObject({
      relatedEntity: "cycle",
      relatedId: "2026-09",
    });
  });

  it("skips the utility_anomaly source once the reading is FINALIZED", () => {
    const tasks = derive({
      utilities: [
        previousUtility,
        { ...anomalousUtility, status: "FINALIZED" },
      ],
    });

    expect(tasks.some((t) => t.type === "utility_anomaly")).toBe(false);
  });

  it("adds a residence_notification task for a live tenant with no completed notice", () => {
    const tasks = derive();
    const task = tasks.find((t) => t.type === "residence_notification");

    expect(task).toMatchObject({ relatedEntity: "tenant", relatedId: "T001" });
  });

  it("adds a residence_registration_expiring task within the 30-day window", () => {
    const tasks = derive({
      complianceItems: [
        {
          id: "RR-T001",
          buildingId: "b1",
          tenantId: "T001",
          tenant: "Nguyễn Văn A",
          room: "Phòng 101",
          type: "residence_registration",
          status: "pending",
          dueDate: "05/10/2026", // 17 days after `today` (18/09/2026)
        },
      ],
    });
    const task = tasks.find(
      (t) => t.type === "residence_registration_expiring",
    );

    expect(task).toMatchObject({ relatedEntity: "tenant", relatedId: "T001" });
  });

  it("skips residence_registration_expiring once the due date is far in the future", () => {
    const tasks = derive({
      complianceItems: [
        {
          id: "RR-T001",
          buildingId: "b1",
          tenantId: "T001",
          tenant: "Nguyễn Văn A",
          room: "Phòng 101",
          type: "residence_registration",
          status: "pending",
          dueDate: "31/12/2027",
        },
      ],
    });

    expect(
      tasks.some((t) => t.type === "residence_registration_expiring"),
    ).toBe(false);
  });

  it("skips residence_notification once the tenant already has one completed", () => {
    const tasks = derive({
      complianceItems: [
        {
          id: "RN-T001",
          buildingId: "b1",
          tenantId: "T001",
          tenant: "Nguyễn Văn A",
          room: "Phòng 101",
          type: "residence_notification",
          status: "completed",
          dueDate: "01/01/2026",
        },
      ],
    });

    expect(tasks.some((t) => t.type === "residence_notification")).toBe(false);
  });

  it("adds batch_pending once the Kỳ's ngày chốt has passed and no Hoá đơn exists yet", () => {
    const tasks = derive({ invoices: [] }, pastCycleEnd);
    const task = tasks.find((t) => t.type === "batch_pending");

    expect(task).toMatchObject({
      relatedEntity: "building",
      relatedId: "b1",
      title: "Trọ Sinh Viên Xanh chưa lập Đợt hoá đơn kỳ 09/2026",
    });
  });

  it("never fires before the Kỳ's ngày chốt, however incomplete the Chỉ số are", () => {
    // `today` is still inside September — the Kỳ isn't over yet, so "chưa
    // lập Đợt" is not a Việc regardless of how many readings are missing.
    const tasks = derive({ invoices: [], utilities: [] });

    expect(tasks.some((t) => t.type === "batch_pending")).toBe(false);
  });

  it("skips batch_pending once a Hoá đơn of the Kỳ already exists", () => {
    const tasks = derive({ invoices: [overdueInvoice] }, pastCycleEnd);

    expect(tasks.some((t) => t.type === "batch_pending")).toBe(false);
  });

  it("scopes batch_pending to one Toà nhà when buildingId is given", () => {
    const otherBuilding = { ...building, id: "b2", name: "Toà nhà khác" };
    const tasks = derive(
      {
        invoices: [],
        buildings: [building, otherBuilding],
        buildingId: "b1",
      },
      pastCycleEnd,
    );

    expect(
      tasks.every((t) => t.type !== "batch_pending" || t.relatedId === "b1"),
    ).toBe(true);
  });

  it("scopes to one Toà nhà when buildingId is given", () => {
    const otherBuilding = { ...building, id: "b2", name: "Toà nhà khác" };
    const tasks = derive({
      buildings: [building, otherBuilding],
      buildingId: "b1",
    });

    expect(tasks.some((t) => t.relatedEntity === "invoice")).toBe(true);
  });

  it("finds nothing outside the given Building scope", () => {
    const tasks = derive({ buildingId: "b-other" });

    expect(tasks).toEqual([]);
  });
});
