import { describe, expect, it } from "vitest";

import type { ComplianceItem } from "~/types/compliance";
import type { Contract } from "~/types/contract";
import type { TenantView } from "~/types/tenant";
import { buildResidenceDeclarations } from "~/utils/residence-declaration";

const today = new Date("2026-09-17T00:00:00.000Z");

function tenant(overrides: Partial<TenantView>): TenantView {
  return {
    id: "T001",
    buildingId: "b1",
    name: "Nguyễn Văn A",
    phone: "0905000001",
    email: "a@gmail.com",
    idNumber: "079000000001",
    gender: "male",
    room: "Phòng 101",
    floor: 1,
    rentAmount: 2_000_000,
    depositAmount: 2_000_000,
    moveInDate: "2026-01-01",
    contractEnd: "2027-12-31",
    status: "active",
    hasOverdueInvoice: false,
    ...overrides,
  };
}

function contract(overrides: Partial<Contract>): Contract {
  return {
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
    startDate: "2026-01-01",
    endDate: "2027-12-31",
    status: "ACTIVE",
    renewalHistory: [],
    lastUpdated: "2026-09-01",
    ...overrides,
  };
}

function complianceItem(overrides: Partial<ComplianceItem>): ComplianceItem {
  return {
    id: "RN-T001",
    buildingId: "b1",
    tenantId: "T001",
    tenant: "Nguyễn Văn A",
    room: "Phòng 101",
    type: "residence_notification",
    status: "completed",
    dueDate: "2026-01-01",
    ...overrides,
  };
}

describe("buildResidenceDeclarations", () => {
  it("drops a tenant with no live contract", () => {
    const declarations = buildResidenceDeclarations({
      tenants: [tenant({})],
      contracts: [contract({ status: "TERMINATED", endDate: "2026-01-01" })],
      complianceItems: [],
      today,
    });

    expect(declarations).toHaveLength(0);
  });

  it("is not_sent when no residence_notification item exists yet", () => {
    const [declaration] = buildResidenceDeclarations({
      tenants: [tenant({})],
      contracts: [contract({})],
      complianceItems: [],
      today,
    });

    expect(declaration?.notificationStatus).toBe("not_sent");
    expect(declaration?.referenceNumber).toBeUndefined();
  });

  it("is sent once the residence_notification item is completed", () => {
    const [declaration] = buildResidenceDeclarations({
      tenants: [tenant({})],
      contracts: [contract({})],
      complianceItems: [
        complianceItem({
          completedDate: "2026-01-05",
          referenceNumber: "CT01-0001",
        }),
      ],
      today,
    });

    expect(declaration?.notificationStatus).toBe("sent");
    expect(declaration?.notificationDate).toBe("2026-01-05");
    expect(declaration?.referenceNumber).toBe("CT01-0001");
  });

  it("flags Đăng ký tạm trú as expiring within the 30-day window", () => {
    const [declaration] = buildResidenceDeclarations({
      tenants: [tenant({})],
      contracts: [contract({})],
      complianceItems: [
        complianceItem({
          type: "residence_registration",
          status: "pending",
          dueDate: "2026-10-10", // 23 days after `today`
        }),
      ],
      today,
    });

    expect(declaration?.registrationExpiringSoon).toBe(true);
  });

  it("does not flag Đăng ký tạm trú past the 30-day window", () => {
    const [declaration] = buildResidenceDeclarations({
      tenants: [tenant({})],
      contracts: [contract({})],
      complianceItems: [
        complianceItem({
          type: "residence_registration",
          status: "pending",
          dueDate: "2026-12-31",
        }),
      ],
      today,
    });

    expect(declaration?.registrationExpiringSoon).toBe(false);
    expect(declaration?.registrationStatus).toBe("pending");
  });

  // Ticket #188 — registrationStatus is suy purely from `dueDate`, never
  // read off the item's own `status`; a stored "completed" is ignored.
  it("derives overdue once the due date has already passed, ignoring a stored status", () => {
    const [declaration] = buildResidenceDeclarations({
      tenants: [tenant({})],
      contracts: [contract({})],
      complianceItems: [
        complianceItem({
          type: "residence_registration",
          status: "completed",
          dueDate: "2026-09-01", // 16 days before `today`
        }),
      ],
      today,
    });

    expect(declaration?.registrationStatus).toBe("overdue");
    expect(declaration?.registrationExpiringSoon).toBe(false);
  });

  it("derives pending (not overdue) on the due date itself", () => {
    const [declaration] = buildResidenceDeclarations({
      tenants: [tenant({})],
      contracts: [contract({})],
      complianceItems: [
        complianceItem({
          type: "residence_registration",
          status: "pending",
          dueDate: "2026-09-17", // = `today`
        }),
      ],
      today,
    });

    expect(declaration?.registrationStatus).toBe("pending");
    expect(declaration?.registrationExpiringSoon).toBe(true);
  });
});
