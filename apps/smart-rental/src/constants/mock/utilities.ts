import type { Utility, UtilityType } from "~/types/utility";
import { mockRooms } from "~/constants/mock/rooms";
import { trackMockReset } from "~/utils/mock-reset";

/**
 * Chỉ số hai Kỳ 08–09/2026 (ADR-0013) — 08 Đã chốt cho mọi Phòng (Đợt của
 * nó đã lập, `mock/invoices.ts`), 09 vẫn Nháp: mỗi Toà nhà đang chốt dở.
 */
const READING_MONTHS = ["2026-08", "2026-09"] as const;
const DRAFT_MONTH = "2026-09";

const occupiedRooms = mockRooms.filter((room) => room.status === "occupied");

// Mỗi Toà nhà, Kỳ 09: đúng một Phòng bất thường (điện vọt > 2× Kỳ 08) và
// đúng một Phòng chưa nhập chỉ số nào — dữ liệu mẫu "đang chốt dở" tự nhất
// quán (ADR-0013), chứ không tự mâu thuẫn như trước round 3. R-B1-102 nằm
// ngoài cả hai tập — `test/pages/main.test.tsx` trỏ thẳng route chi tiết
// chỉ số của nó cho Kỳ 09.
const ANOMALOUS_ROOM_IDS = new Set(["R-B1-103", "R-B2-202", "R-B3-302"]);
const MISSING_ROOM_IDS = new Set(["R-B1-106", "R-B2-208", "R-B3-304"]);

function buildReading(
  room: (typeof occupiedRooms)[number],
  type: UtilityType,
  month: string,
  index: number,
  isAnomaly: boolean,
): Utility {
  const base = type === "electricity" ? 120 : 8;
  const oldIndex = 1000 + index * 25;
  // Kỳ 08 tiêu thụ bình thường; một Phòng bất thường mỗi Toà nhà (điện) vọt
  // hơn 2× kỳ trước — spec #153's "≥ 1 Chỉ số tiêu thụ > 2× kỳ trước".
  const consumption = isAnomaly ? base * 2 + 30 : base + (index % 5) * 3;
  const newIndex = oldIndex + consumption;

  return {
    id: `util-${month.replace("-", "")}-${room.id}-${type === "electricity" ? "d" : "n"}`,
    buildingId: room.buildingId,
    roomId: room.id,
    roomName: room.name,
    month,
    type,
    oldIndex,
    newIndex,
    consumption,
    status: month === DRAFT_MONTH ? "DRAFT" : "FINALIZED",
    updatedAt:
      month === DRAFT_MONTH ? "2026-09-15T09:00:00Z" : "2026-08-27T09:00:00Z",
    proofImages: [],
  };
}

/**
 * The Mock every Chỉ số điện nước read comes from (ADR-0012, spec #153,
 * ADR-0013) — điện + nước, hai Kỳ, for every occupied Phòng đã chốt (08);
 * Kỳ 09 skips each Toà nhà's one "chưa nhập" Phòng entirely and flags its
 * one anomalous Phòng's điện reading.
 */
export const mockUtilities: Utility[] = READING_MONTHS.flatMap((month) =>
  occupiedRooms
    .filter((room) => month !== DRAFT_MONTH || !MISSING_ROOM_IDS.has(room.id))
    .flatMap((room, index) => [
      buildReading(
        room,
        "electricity",
        month,
        index,
        month === DRAFT_MONTH && ANOMALOUS_ROOM_IDS.has(room.id),
      ),
      buildReading(room, "water", month, index, false),
    ]),
);

export const resetMockUtilities = trackMockReset(mockUtilities);
