import { describe, expect, it } from "vitest";

import { contractFormSchema } from "~/features/contracts/types/contract-form";

const valid = {
  roomId: "R-B1-101",
  tenantId: "T001",
  startDate: "2026-05-01",
  endDate: "2026-11-01",
  rentAmount: "3000000",
  depositAmount: "3000000",
  paymentDueDay: "5",
  noticeDays: "30",
};

describe("contractFormSchema", () => {
  it("parses the numeric strings the inputs hand over", () => {
    expect(contractFormSchema.parse(valid)).toMatchObject({
      rentAmount: 3000000,
      depositAmount: 3000000,
      paymentDueDay: 5,
      noticeDays: 30,
    });
  });

  it("names the missing Phòng and Người thuê", () => {
    const result = contractFormSchema.safeParse({
      ...valid,
      roomId: "",
      tenantId: "",
    });

    expect(result.error?.issues.map((issue) => issue.message)).toEqual([
      "Vui lòng chọn phòng",
      "Vui lòng chọn người thuê",
    ]);
  });

  it("rejects an end date on or before the start date", () => {
    const result = contractFormSchema.safeParse({
      ...valid,
      startDate: "2026-05-01",
      endDate: "2026-05-01",
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toEqual(["endDate"]);
  });

  it("wants ngày thu within 1–31 and a positive rent", () => {
    expect(
      contractFormSchema.safeParse({ ...valid, paymentDueDay: "32" }).success,
    ).toBe(false);
    expect(
      contractFormSchema.safeParse({ ...valid, paymentDueDay: "0" }).success,
    ).toBe(false);
    expect(
      contractFormSchema.safeParse({ ...valid, rentAmount: "0" }).success,
    ).toBe(false);
  });
});
