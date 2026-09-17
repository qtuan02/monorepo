import type { Control } from "react-hook-form";
import { Controller } from "react-hook-form";

import { Badge } from "@monorepo/ui/components/badge";
import { Button } from "@monorepo/ui/components/button";
import { Field, FieldError } from "@monorepo/ui/components/field";
import { Input } from "@monorepo/ui/components/input";
import { TableCell, TableRow } from "@monorepo/ui/components/table";
import { cn } from "@monorepo/ui/utils/cn";

import type { MeterInputFormValues } from "~/features/utilities/types/meter-input-form";
import type { MeterReading } from "~/features/utilities/utils/meter-reading";
import type { MeterInputRoom } from "~/types/utility";
import { StatusBadge } from "~/components/badge/status-badge";
import { meterEntryStatusConfig } from "~/constants/status";
import { useMeterEntryState } from "~/features/utilities/hooks/use-meter-entry-state";

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
 * One Phòng on "Nhập chỉ số" — the desktop table row. A "bất thường" row
 * shows "Duyệt bất thường" beside its badge; approving it sets
 * `rows.{index}.approved`, which is what the screen's single save button
 * gates on (spec #153 §10 row 27).
 */
export default function MeterInputRow({
  index,
  room,
  control,
}: MeterInputRowProps) {
  const { electricity, water, status, approved } = useMeterEntryState(
    control,
    index,
    room,
  );

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
            <Field data-invalid={fieldState.invalid} className="w-28">
              <Input
                {...field}
                type="number"
                min={0}
                aria-label={`Chỉ số điện mới phòng ${room.name}`}
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
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
            <Field data-invalid={fieldState.invalid} className="w-28">
              <Input
                {...field}
                type="number"
                min={0}
                aria-label={`Chỉ số nước mới phòng ${room.name}`}
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </TableCell>
      <ConsumptionCell reading={water} />
      <TableCell className="text-right">
        <div className="flex items-center justify-end gap-2">
          {status === "anomaly" && !approved ? (
            <>
              <StatusBadge config={meterEntryStatusConfig.anomaly} isCompact />
              <Controller
                name={`rows.${index}.approved`}
                control={control}
                render={({ field }) => (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => field.onChange(true)}
                  >
                    Duyệt bất thường
                  </Button>
                )}
              />
            </>
          ) : status === "anomaly" && approved ? (
            <StatusBadge config={meterEntryStatusConfig.approved} isCompact />
          ) : status ? (
            <StatusBadge config={meterEntryStatusConfig[status]} isCompact />
          ) : (
            <Badge variant="outline">Chưa nhập</Badge>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}
