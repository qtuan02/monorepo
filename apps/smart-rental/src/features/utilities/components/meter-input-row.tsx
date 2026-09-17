import type { Control } from "react-hook-form";
import { Controller, useWatch } from "react-hook-form";

import { Badge } from "@monorepo/ui/components/badge";
import { Input } from "@monorepo/ui/components/input";
import { TableCell, TableRow } from "@monorepo/ui/components/table";
import { cn } from "@monorepo/ui/utils/cn";

import type { MeterInputFormValues } from "~/features/utilities/types/meter-input-form";
import type { MeterReading } from "~/features/utilities/utils/meter-reading";
import type { MeterInputRoom } from "~/types/utility";
import { StatusBadge } from "~/components/badge/status-badge";
import { utilityStatusConfig } from "~/constants/status";
import {
  combineMeterStatus,
  readMeter,
} from "~/features/utilities/utils/meter-reading";

interface MeterInputRowProps {
  index: number;
  room: MeterInputRoom;
  control: Control<MeterInputFormValues>;
}

function ConsumptionCell({ reading }: { reading: MeterReading }) {
  return (
    <TableCell
      className={cn(
        "tabular-nums",
        reading.status === "anomaly" ? "text-destructive" : "text-primary",
      )}
    >
      {reading.consumption ?? "—"}
    </TableCell>
  );
}

/**
 * One Phòng on "Nhập chỉ số". Each row watches only its own two fields, so a
 * keystroke re-renders this row and not the table; consumption is new − old
 * computed in render, and the badge is the derived draft/anomaly.
 */
export default function MeterInputRow({
  index,
  room,
  control,
}: MeterInputRowProps) {
  const [newElectricity, newWater] = useWatch({
    control,
    name: [`rows.${index}.newElectricity`, `rows.${index}.newWater`],
  });
  const electricity = readMeter(room.lastElectricity, newElectricity);
  const water = readMeter(room.lastWater, newWater);
  const status = combineMeterStatus(electricity.status, water.status);

  return (
    <TableRow>
      <TableCell className="font-medium">{room.name}</TableCell>
      <TableCell className="text-muted-foreground tabular-nums">
        {room.lastElectricity}
      </TableCell>
      <TableCell>
        <Controller
          name={`rows.${index}.newElectricity`}
          control={control}
          render={({ field, fieldState }) => (
            <Input
              {...field}
              type="number"
              min={0}
              aria-label={`Chỉ số điện mới phòng ${room.name}`}
              aria-invalid={fieldState.invalid}
              className="w-24"
            />
          )}
        />
      </TableCell>
      <ConsumptionCell reading={electricity} />
      <TableCell className="text-muted-foreground tabular-nums">
        {room.lastWater}
      </TableCell>
      <TableCell>
        <Controller
          name={`rows.${index}.newWater`}
          control={control}
          render={({ field, fieldState }) => (
            <Input
              {...field}
              type="number"
              min={0}
              aria-label={`Chỉ số nước mới phòng ${room.name}`}
              aria-invalid={fieldState.invalid}
              className="w-24"
            />
          )}
        />
      </TableCell>
      <ConsumptionCell reading={water} />
      <TableCell className="text-right">
        {status ? (
          <StatusBadge config={utilityStatusConfig[status]} />
        ) : (
          <Badge variant="outline">Chưa nhập</Badge>
        )}
      </TableCell>
    </TableRow>
  );
}
