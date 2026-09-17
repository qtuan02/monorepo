import { describe, expect, it } from "vitest";

import type { Building } from "~/types/building";
import type { ComplianceItem } from "~/types/compliance";
import type { Contract } from "~/types/contract";
import type { Invoice } from "~/types/invoice";
import type { Tenant } from "~/types/tenant";
import type { Utility } from "~/types/utility";
import { deriveTasks } from "~/utils/task-derivation";

const today = new Date("2026-09-17T00:00:00.000Z");

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
  paymentDueDay: 5,
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
  status: "VERIFIED",
};

const noComplianceItems: ComplianceItem[] = [];

function derive(overrides: Partial<Parameters<typeof deriveTasks>[0]> = {}) {
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
    today,
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

  it("adds a utility_anomaly task for an unconfirmed anomalous reading", () => {
    const tasks = derive();
    const task = tasks.find((t) => t.type === "utility_anomaly");

    expect(task).toMatchObject({
      relatedEntity: "utility",
      relatedId: "u-sep",
    });
  });

  it("skips the utility_anomaly source once the reading is VERIFIED", () => {
    const tasks = derive({
      utilities: [previousUtility, { ...anomalousUtility, status: "VERIFIED" }],
    });

    expect(tasks.some((t) => t.type === "utility_anomaly")).toBe(false);
  });

  it("adds a residence_notification task for a live tenant with no completed notice", () => {
    const tasks = derive();
    const task = tasks.find((t) => t.type === "residence_notification");

    expect(task).toMatchObject({ relatedEntity: "tenant", relatedId: "T001" });
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

  it("adds a batch_pending task while the Toà nhà still has an unconfirmed reading this kỳ", () => {
    const tasks = derive();
    const task = tasks.find((t) => t.type === "batch_pending");

    expect(task).toMatchObject({ relatedEntity: "building", relatedId: "b1" });
  });

  it("skips batch_pending once every reading this kỳ is VERIFIED", () => {
    const tasks = derive({
      utilities: [previousUtility, { ...anomalousUtility, status: "VERIFIED" }],
    });

    expect(tasks.some((t) => t.type === "batch_pending")).toBe(false);
  });
});
