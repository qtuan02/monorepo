import { describe, expect, it } from "vitest";

import { renewContractFormSchema } from "~/features/contracts/types/renew-contract-form";

describe("renewContractFormSchema", () => {
  it("parses the new rent into a number and keeps the notes", () => {
    expect(
      renewContractFormSchema.parse({
        newEndDate: "2027-01-01",
        newRentAmount: "3500000",
        notes: " Tăng 500k ",
      }),
    ).toEqual({
      newEndDate: "2027-01-01",
      newRentAmount: 3500000,
      notes: "Tăng 500k",
    });
  });

  it("requires the new end date", () => {
    const result = renewContractFormSchema.safeParse({
      newEndDate: "",
      newRentAmount: "3500000",
      notes: "",
    });

    expect(result.error?.issues[0]?.message).toBe(
      "Vui lòng chọn ngày kết thúc mới",
    );
  });
});
