/**
 * The prototype's `Utility` — one Chỉ số điện nước reading (glossary: never a
 * "tiện ích"), shape kept 1:1 until `be-motel` has a contract.
 */
export type UtilityType = "electricity" | "water";

/**
 * Enum per `billing-service` contract (ADR-0012) — "bất thường" is not a
 * persisted state: it is computed live while entering a reading (see
 * `MeterEntryStatus`), never written to a Chỉ số record.
 */
export type UtilityStatus = "DRAFT" | "VERIFIED";

/** The live "while typing" state of one reading on "Nhập chỉ số" — never persisted. */
export type MeterEntryStatus = "draft" | "anomaly" | "approved";

export interface Utility {
  id: string;
  buildingId: string;
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
  /** Scope to one Phòng's own Chỉ số — a Hợp đồng detail screen's "Chỉ số" tab. */
  roomId?: string;
}

/**
 * One Phòng on the "Nhập chỉ số" screen: its last readings before the
 * selected kỳ, plus the previous period's own consumption — the baseline
 * `isUtilityAnomalous` needs to catch a "> 2× kỳ trước" reading, not just a
 * regression against the index alone.
 */
export interface MeterInputRoom {
  id: string;
  name: string;
  lastElectricity: number;
  lastWater: number;
  previousElectricityConsumption: number;
  previousWaterConsumption: number;
}
