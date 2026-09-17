import { describe, expect, it } from "vitest";

import { buildingFormSchema } from "~/features/buildings/types/building-form";

const valid = {
  name: "Trọ Mới",
  address: "12 Lê Lợi, Đà Nẵng",
  totalFloors: "3",
  utilityCycleDay: "25",
  note: "",
};

describe("buildingFormSchema", () => {
  it("parses the form's strings into the numbers the request wants", () => {
    expect(buildingFormSchema.parse(valid)).toEqual({
      name: "Trọ Mới",
      address: "12 Lê Lợi, Đà Nẵng",
      totalFloors: 3,
      utilityCycleDay: 25,
      note: undefined,
    });
  });

  it("trims before checking length, so whitespace is not a name", () => {
    const result = buildingFormSchema.safeParse({ ...valid, name: "  a  " });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe(
      "Tên tòa nhà phải có ít nhất 2 ký tự",
    );
  });

  it("keeps the cycle day inside a month", () => {
    const result = buildingFormSchema.safeParse({
      ...valid,
      utilityCycleDay: "32",
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe("Ngày từ 1 đến 31");
  });

  it("wants at least one floor, as a whole number", () => {
    expect(
      buildingFormSchema.safeParse({ ...valid, totalFloors: "0" }).success,
    ).toBe(false);
    expect(
      buildingFormSchema.safeParse({ ...valid, totalFloors: "1.5" }).success,
    ).toBe(false);
  });

  it("drops a blank note", () => {
    expect(buildingFormSchema.parse({ ...valid, note: "   " }).note).toBe(
      undefined,
    );
  });
});
