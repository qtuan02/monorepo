import { describe, expect, it } from "vitest";

import { meterInputFormSchema } from "~/features/utilities/types/meter-input-form";

const row = { id: "1", newElectricity: "", newWater: "" };

describe("meterInputFormSchema", () => {
  it("lets a row stay empty — not every Phòng is read at once", () => {
    expect(meterInputFormSchema.safeParse({ rows: [row] }).success).toBe(true);
  });

  it("accepts a whole-number reading", () => {
    expect(
      meterInputFormSchema.safeParse({
        rows: [{ ...row, newElectricity: "1300", newWater: "460" }],
      }).success,
    ).toBe(true);
  });

  it("refuses a reading that is not a whole number, by name", () => {
    const result = meterInputFormSchema.safeParse({
      rows: [{ ...row, newElectricity: "12.5" }],
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toEqual([
      "rows",
      0,
      "newElectricity",
    ]);
    expect(result.error?.issues[0]?.message).toBe("Chỉ số phải là số nguyên");
  });
});
