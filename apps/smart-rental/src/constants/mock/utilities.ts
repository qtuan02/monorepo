import type { MeterInputRoom, Utility, UtilityType } from "~/types/utility";
import { mockRooms } from "~/constants/mock/rooms";

/** Chỉ số hai kỳ 08–09/2026 (spec #153) — kỳ 09 chưa lập Đợt, nên vẫn còn việc. */
const READING_MONTHS = ["2026-08", "2026-09"] as const;

const occupiedRooms = mockRooms.filter((room) => room.status === "occupied");

function buildReading(
  room: (typeof occupiedRooms)[number],
  type: UtilityType,
  month: string,
  index: number,
  isAnomaly: boolean,
): Utility {
  const base = type === "electricity" ? 120 : 8;
  const oldIndex = 1000 + index * 25;
  // Kỳ 08 tiêu thụ bình thường; kỳ 09 của phòng đầu tiên (electric) vọt hơn
  // 2× kỳ trước — spec #153's "≥ 1 Chỉ số tiêu thụ > 2× kỳ trước".
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
    status: month === "2026-09" ? "DRAFT" : "VERIFIED",
    updatedAt:
      month === "2026-09" ? "2026-09-15T09:00:00Z" : "2026-08-27T09:00:00Z",
    proofImages: [],
  };
}

/**
 * The Mock every Chỉ số điện nước read comes from (ADR-0012, spec #153) —
 * điện + nước, hai kỳ, for every occupied Phòng. The first Phòng's electric
 * reading in kỳ 09 is the ">2×" record the spec calls for.
 */
export const mockUtilities: Utility[] = READING_MONTHS.flatMap((month) =>
  occupiedRooms.flatMap((room, index) => [
    buildReading(
      room,
      "electricity",
      month,
      index,
      month === "2026-09" && index === 0,
    ),
    buildReading(room, "water", month, index, false),
  ]),
);

/** The Phòng the "Nhập chỉ số" screen lists, with last month's readings. */
export const mockMeterInputRooms: MeterInputRoom[] = occupiedRooms.map(
  (room) => {
    const electric = mockUtilities.find(
      (u) =>
        u.roomId === room.id &&
        u.type === "electricity" &&
        u.month === "2026-09",
    );
    const water = mockUtilities.find(
      (u) =>
        u.roomId === room.id && u.type === "water" && u.month === "2026-09",
    );
    return {
      id: room.id,
      name: room.name,
      lastElectricity: electric?.oldIndex ?? 0,
      lastWater: water?.oldIndex ?? 0,
    };
  },
);
