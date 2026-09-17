import type { Room } from "~/types/room";
import type { MeterInputRoom, Utility, UtilityType } from "~/types/utility";

/**
 * The rows "Nhập chỉ số" lists for one Toà nhà + kỳ (ADR-0012, spec #153):
 * every occupied Phòng, each with the last reading strictly before that kỳ
 * (baseline "cũ") and the period before that reading's own consumption (the
 * anomaly ratio's "kỳ trước"). A room already read for `month` is not
 * filtered out — re-entering simply overwrites it on save. Lives in
 * `~/utils` rather than the slice's own `utils/` because `~/hooks/api`
 * calls it, and a hook may not import from `~/features`.
 */
export function buildMeterInputRooms(
  buildingId: string,
  month: string,
  rooms: Room[],
  utilities: Utility[],
): MeterInputRoom[] {
  const occupiedRooms = rooms.filter(
    (room) => room.buildingId === buildingId && room.status === "occupied",
  );

  function lastBefore(roomId: string, type: UtilityType) {
    return utilities
      .filter(
        (utility) =>
          utility.roomId === roomId &&
          utility.type === type &&
          utility.month < month,
      )
      .sort((a, b) => b.month.localeCompare(a.month))[0];
  }

  return occupiedRooms.map((room) => {
    const lastElectricity = lastBefore(room.id, "electricity");
    const lastWater = lastBefore(room.id, "water");
    return {
      id: room.id,
      name: room.name,
      lastElectricity: lastElectricity?.newIndex ?? 0,
      lastWater: lastWater?.newIndex ?? 0,
      previousElectricityConsumption: lastElectricity?.consumption ?? 0,
      previousWaterConsumption: lastWater?.consumption ?? 0,
    };
  });
}
