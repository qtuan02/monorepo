import { describe, expect, it } from "vitest";

import { ELECTRICITY_PRICE_CAP_PER_KWH } from "~/constants/tariff";
import { isElectricityPriceOverCap } from "~/utils/tariff";

describe("isElectricityPriceOverCap", () => {
  it("is false at exactly the cap", () => {
    expect(isElectricityPriceOverCap(ELECTRICITY_PRICE_CAP_PER_KWH)).toBe(
      false,
    );
  });

  it("is true just above the cap", () => {
    expect(isElectricityPriceOverCap(ELECTRICITY_PRICE_CAP_PER_KWH + 1)).toBe(
      true,
    );
  });

  it("is false for a Bảng giá under the cap", () => {
    expect(isElectricityPriceOverCap(3500)).toBe(false);
  });
});
