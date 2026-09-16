import type { Building } from "~/types/building";

/**
 * The four figures a Toà nhà card shows. The Mock carries only `totalRooms`
 * and `activeContracts` for most Toà nhà, and the prototype rendered the
 * missing two as 0 — here they are derived instead, so the card says
 * something true until the backend sends them.
 */
export function getBuildingStats(building: Building) {
  const totalRooms = building.totalRooms ?? 0;
  const activeContracts = building.activeContracts ?? 0;
  const availableRooms =
    building.availableRooms ?? Math.max(0, totalRooms - activeContracts);
  const occupancyRate =
    building.occupancyRate ??
    (totalRooms === 0 ? 0 : Math.round((activeContracts / totalRooms) * 100));

  return { totalRooms, activeContracts, availableRooms, occupancyRate };
}
