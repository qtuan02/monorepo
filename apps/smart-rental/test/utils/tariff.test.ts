import { describe, expect, it } from "vitest";

import { mockBuildings } from "~/constants/mock/buildings";
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

  it("is false for a Bảng giá comfortably under the cap", () => {
    expect(isElectricityPriceOverCap(2_000)).toBe(false);
  });

  it("flags at least one Mock Toà nhà as over cap, so the Alert has a real case to show", () => {
    const overCap = mockBuildings.filter((building) =>
      isElectricityPriceOverCap(building.priceList.electricityPricePerKwh),
    );
    expect(overCap.length).toBeGreaterThan(0);
  });
});
