import { describe, expect, it } from "vitest";

import {
  electricityTierFormSchema,
  nextTierFrom,
  toElectricityTierFormInput,
} from "~/features/settings/types/electricity-tier-form";

describe("electricityTierFormSchema", () => {
  it("parses the strings an <input type=number> hands over into numbers, with an empty «Đến» as the open end", () => {
    const parsed = electricityTierFormSchema.parse({
      useVat: true,
      tiers: [
        { from: "0", to: "50", price: "1678" },
        { from: "51", to: "", price: "1734" },
      ],
    });

    expect(parsed).toEqual({
      useVat: true,
      tiers: [
        { from: 0, to: 50, price: 1678 },
        { from: 51, to: null, price: 1734 },
      ],
    });
  });

  it("names a missing price and a negative one", () => {
    const result = electricityTierFormSchema.safeParse({
      useVat: false,
      tiers: [{ from: "0", to: "50", price: "" }],
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe("Đơn giá là bắt buộc");
    expect(
      electricityTierFormSchema.safeParse({
        useVat: false,
        tiers: [{ from: "0", to: "50", price: "-1" }],
      }).success,
    ).toBe(false);
  });

  it("needs at least one step", () => {
    expect(
      electricityTierFormSchema.safeParse({ useVat: false, tiers: [] }).success,
    ).toBe(false);
  });
});

describe("toElectricityTierFormInput / nextTierFrom", () => {
  it("round-trips the Mock into the form's strings, «Đến» blank when open", () => {
    expect(
      toElectricityTierFormInput({
        useVat: true,
        tiers: [{ from: 201, to: null, price: 2536 }],
      }),
    ).toEqual({
      useVat: true,
      tiers: [{ from: "201", to: "", price: "2536" }],
    });
  });

  it("starts the next step one kWh after the last «Đến», or at 0 with no steps", () => {
    expect(nextTierFrom([{ from: "0", to: "50", price: "1" }])).toBe("51");
    expect(nextTierFrom([{ from: "51", to: "", price: "1" }])).toBe("52");
    expect(nextTierFrom([])).toBe("0");
  });
});
