import type { Control } from "react-hook-form";
import { useWatch } from "react-hook-form";

import type { MeterInputFormValues } from "~/features/utilities/types/meter-input-form";
import type { MeterReading } from "~/features/utilities/utils/meter-reading";
import type { MeterInputRoom } from "~/types/utility";
import {
  combineMeterStatus,
  readMeter,
} from "~/features/utilities/utils/meter-reading";

export interface MeterEntryState {
  electricity: MeterReading;
  water: MeterReading;
  /** The combined draft/anomaly badge, before `approved` overrides it. */
  status: ReturnType<typeof combineMeterStatus>;
  approved: boolean;
}

/**
 * One Phòng row's live state on "Nhập chỉ số" — shared by the desktop table
 * row and the mobile card so the two never derive it differently. Watches
 * only this row's three fields, so a keystroke re-renders the one row/card,
 * not the whole screen.
 */
export function useMeterEntryState(
  control: Control<MeterInputFormValues>,
  index: number,
  room: MeterInputRoom,
): MeterEntryState {
  const [newElectricity, newWater, approved] = useWatch({
    control,
    name: [
      `rows.${index}.newElectricity`,
      `rows.${index}.newWater`,
      `rows.${index}.approved`,
    ],
  });
  const electricity = readMeter(
    room.lastElectricity,
    newElectricity,
    room.previousElectricityConsumption,
  );
  const water = readMeter(
    room.lastWater,
    newWater,
    room.previousWaterConsumption,
  );

  return {
    electricity,
    water,
    status: combineMeterStatus(electricity.status, water.status),
    approved: !!approved,
  };
}
