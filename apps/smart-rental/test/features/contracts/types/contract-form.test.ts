import { describe, expect, it } from "vitest";

import { contractFormSchema } from "~/features/contracts/types/contract-form";

const valid = {
  buildingId: "b1",
  roomId: "R-B1-101",
  tenantName: "Nguyễn Văn An",
  tenantPhone: "0905123456",
  tenantIdCard: "079123456789",
  startDate: "2026-05-01",
  termMonths: "6",
  rentAmount: "3000000",
  depositAmount: "3000000",
};

describe("contractFormSchema", () => {
  it("parses the numeric strings the inputs hand over", () => {
    expect(contractFormSchema.parse(valid)).toMatchObject({
      termMonths: 6,
      rentAmount: 3000000,
      depositAmount: 3000000,
    });
  });

  it("names the missing Phòng and Toà nhà", () => {
    const result = contractFormSchema.safeParse({
      ...valid,
      buildingId: "",
      roomId: "",
    });

    expect(result.error?.issues.map((issue) => issue.message)).toEqual([
      "Vui lòng chọn toà nhà",
      "Vui lòng chọn phòng",
    ]);
  });

  it("wants at least one whole month and a positive rent", () => {
    expect(
      contractFormSchema.safeParse({ ...valid, termMonths: "0" }).success,
    ).toBe(false);
    expect(
      contractFormSchema.safeParse({ ...valid, termMonths: "1.5" }).success,
    ).toBe(false);
    expect(
      contractFormSchema.safeParse({ ...valid, rentAmount: "0" }).success,
    ).toBe(false);
  });
});
