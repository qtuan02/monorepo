/** The prototype's `Setting`, shape kept 1:1 until `be-motel` has a contract. */
export type SettingCategory = "building" | "rent" | "notification" | "billing";

export type SettingType = "text" | "number" | "toggle" | "select";

export interface Setting {
  id: string;
  category: SettingCategory;
  key: string;
  label: string;
  value: string | number | boolean;
  description?: string;
  type: SettingType;
  /** Already display-formatted (`DD/MM/YYYY`) in the prototype's Mock. */
  updated: string;
}

/** One step of Giá điện bậc thang: `to` is `null` on the open-ended last step. */
export interface ElectricityTier {
  from: number;
  to: number | null;
  /** đ per kWh. */
  price: number;
}

export interface ElectricityTierConfig {
  useVat: boolean;
  tiers: ElectricityTier[];
}
