/**
 * Trạng thái một hàng/Phòng trên màn Kỳ (ADR-0013): `EMPTY` (Phòng trống,
 * không lập), `MISSING` (thiếu chỉ số), `ANOMALY` (bất thường — không lập ở
 * ticket này, duyệt riêng là ticket kế), `READY` (đủ điều kiện), `INVOICED`
 * (Phòng đã có Hoá đơn của kỳ).
 */
export type CycleRowStatus =
  | "EMPTY"
  | "MISSING"
  | "ANOMALY"
  | "READY"
  | "INVOICED";

/**
 * One Phòng's row on "Kỳ điện nước & hoá đơn" (`cycle-rows`, ADR-0013) —
 * replaces the old Đợt hoá đơn tick table and Nhập chỉ số rows with one
 * table: chỉ số cũ (đọc), chỉ số mới (điền sẵn Nháp nếu có), tiêu thụ, tiền
 * theo Bảng giá của Toà nhà, và `reason` — why the row is or isn't lập-able.
 */
export interface CycleRow {
  roomId: string;
  roomName: string;
  /** `null` when the Phòng has no Hợp đồng hiệu lực (EMPTY). */
  contractId: string | null;
  tenant: string | null;
  rentAmount: number;
  oldElectricity: number;
  oldWater: number;
  /** `null` while no Chỉ số of this kỳ has been entered yet. */
  newElectricity: number | null;
  newWater: number | null;
  electricityConsumption: number | null;
  waterConsumption: number | null;
  electricAmount: number;
  waterAmount: number;
  /** Tiền phòng + điện + nước + dịch vụ — what Lập would bill. */
  totalAmount: number;
  status: CycleRowStatus;
  reason: string;
}
