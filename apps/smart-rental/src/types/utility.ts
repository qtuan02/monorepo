/**
 * The prototype's `Utility` — one Chỉ số điện nước reading (glossary: never a
 * "tiện ích"), shape kept 1:1 until `be-motel` has a contract.
 */
export type UtilityType = "electricity" | "water";

/**
 * Nháp → Đã chốt (ADR-0013) — "bất thường" is never a persisted state: it is
 * a cờ suy ra off the reading itself (see `~/utils/utility-anomaly`), never
 * written to a Chỉ số record.
 */
export type UtilityStatus = "DRAFT" | "FINALIZED";

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
