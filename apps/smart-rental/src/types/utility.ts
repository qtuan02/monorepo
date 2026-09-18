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
  /**
   * Set on "Duyệt điện" / "Duyệt nước" (ticket #183) — a landlord's sign-off
   * that an otherwise-bất-thường reading is correct, so it stops counting as
   * one (`~/utils/utility-anomaly`). Never suppresses the "chỉ số mới < cũ"
   * block, which is caught at input time instead.
   */
  approved: boolean;
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
 * "Sửa chỉ số cũ" (ticket #183, ADR-0013) — a landlord's correction to one
 * Phòng's chỉ số cũ for one Kỳ + loại, when a công tơ was replaced mid-kỳ.
 * Kept separate from `Utility` (never edits a past kỳ's own reading) so the
 * correction only changes what THIS kỳ starts counting from.
 */
export interface UtilityOldIndexOverride {
  id: string;
  roomId: string;
  type: UtilityType;
  /** The Kỳ (`YYYY-MM`) this correction applies to. */
  month: string;
  oldIndex: number;
  note: string;
  /** ISO timestamp. */
  updatedAt: string;
}
