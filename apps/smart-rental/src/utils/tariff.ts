import { ELECTRICITY_PRICE_CAP_PER_KWH } from "~/constants/tariff";

/** "cảnh báo khi đơn giá điện > trần" (spec #153 §10 row 28). */
export function isElectricityPriceOverCap(pricePerKwh: number): boolean {
  return pricePerKwh > ELECTRICITY_PRICE_CAP_PER_KWH;
}
