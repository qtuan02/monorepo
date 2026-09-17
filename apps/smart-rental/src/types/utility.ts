/**
 * The prototype's `Utility` — one Chỉ số điện nước reading (glossary: never a
 * "tiện ích"), shape kept 1:1 until `be-motel` has a contract.
 */
export type UtilityType = "electricity" | "water";

export type UtilityStatus = "draft" | "verified" | "anomaly";

export interface Utility {
  id: string;
  buildingId?: string;
  roomId: string;
  roomName: string;
  /** `YYYY-MM`. */
  month: string;
  type: UtilityType;
  oldIndex: number;
  newIndex: number;
  consumption: number;
  status: UtilityStatus;
  /** ISO timestamp. */
  updatedAt: string;
  proofImages: string[];
}

export interface UtilityListParams {
  /** The Building scope; `null` or absent means every Toà nhà. */
  buildingId?: string | null;
}

/** One Phòng on the "Nhập chỉ số" screen: its last readings, before this month's. */
export interface MeterInputRoom {
  id: string;
  name: string;
  lastElectricity: number;
  lastWater: number;
}
