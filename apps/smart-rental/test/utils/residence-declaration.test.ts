import { describe, expect, it } from "vitest";

import type { ComplianceItem } from "~/types/compliance";
import type { Contract } from "~/types/contract";
import type { Tenant } from "~/types/tenant";
import { buildResidenceDeclarations } from "~/utils/residence-declaration";

const today = new Date("2026-09-17T00:00:00.000Z");

function tenant(overrides: Partial<Tenant>): Tenant {
  return {
    id: "T001",
    buildingId: "b1",
    name: "Nguyễn Văn A",
    phone: "0905000001",
    email: "a@gmail.com",
    room: "Phòng 101",
    floor: 1,
    rentAmount: 2_000_000,
    depositAmount: 2_000_000,
    moveInDate: "01/01/2026",
    contractEnd: "31/12/2027",
    idNumber: "079000000001",
    gender: "male",
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
    paymentDueDay: 5,
    noticeDays: 30,
    startDate: "01/01/2026",
    endDate: "31/12/2027",
    status: "ACTIVE",
    renewalHistory: [],
    lastUpdated: "01/09/2026",
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
    dueDate: "01/01/2026",
    ...overrides,
  };
}

describe("buildResidenceDeclarations", () => {
  it("drops a tenant with no live contract", () => {
    const declarations = buildResidenceDeclarations(
      [tenant({})],
      [contract({ status: "TERMINATED", endDate: "01/01/2026" })],
      [],
      today,
    );

    expect(declarations).toHaveLength(0);
  });

  it("is not_sent when no residence_notification item exists yet", () => {
    const [declaration] = buildResidenceDeclarations(
      [tenant({})],
      [contract({})],
      [],
      today,
    );

    expect(declaration?.notificationStatus).toBe("not_sent");
    expect(declaration?.referenceNumber).toBeUndefined();
  });

  it("is sent once the residence_notification item is completed", () => {
    const [declaration] = buildResidenceDeclarations(
      [tenant({})],
      [contract({})],
      [
        complianceItem({
          completedDate: "05/01/2026",
          referenceNumber: "CT01-0001",
        }),
      ],
      today,
    );

    expect(declaration?.notificationStatus).toBe("sent");
    expect(declaration?.notificationDate).toBe("05/01/2026");
    expect(declaration?.referenceNumber).toBe("CT01-0001");
  });

  it("flags Đăng ký tạm trú as expiring within the 30-day window", () => {
    const [declaration] = buildResidenceDeclarations(
      [tenant({})],
      [contract({})],
      [
        complianceItem({
          type: "residence_registration",
          status: "pending",
          dueDate: "10/10/2026", // 23 days after `today`
        }),
      ],
      today,
    );

    expect(declaration?.registrationExpiringSoon).toBe(true);
  });

  it("does not flag Đăng ký tạm trú as expiring once it is already completed", () => {
    const [declaration] = buildResidenceDeclarations(
      [tenant({})],
      [contract({})],
      [
        complianceItem({
          type: "residence_registration",
          status: "completed",
          dueDate: "10/10/2026",
        }),
      ],
      today,
    );

    expect(declaration?.registrationExpiringSoon).toBe(false);
  });

  it("does not flag Đăng ký tạm trú past the 30-day window", () => {
    const [declaration] = buildResidenceDeclarations(
      [tenant({})],
      [contract({})],
      [
        complianceItem({
          type: "residence_registration",
          status: "pending",
          dueDate: "31/12/2026",
        }),
      ],
      today,
    );

    expect(declaration?.registrationExpiringSoon).toBe(false);
  });
});
