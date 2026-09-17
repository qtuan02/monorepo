import type { Control } from "react-hook-form";
import { Controller } from "react-hook-form";

import { Badge } from "@monorepo/ui/components/badge";
import { Button } from "@monorepo/ui/components/button";
import { Card, CardContent, CardHeader } from "@monorepo/ui/components/card";
import { Field, FieldError, FieldLabel } from "@monorepo/ui/components/field";
import { Input } from "@monorepo/ui/components/input";
import { cn } from "@monorepo/ui/utils/cn";

import type { MeterInputFormValues } from "~/features/utilities/types/meter-input-form";
import type { MeterReading } from "~/features/utilities/utils/meter-reading";
import type { MeterInputRoom } from "~/types/utility";
import { StatusBadge } from "~/components/badge/status-badge";
import { meterEntryStatusConfig } from "~/constants/status";
import { useMeterEntryState } from "~/features/utilities/hooks/use-meter-entry-state";

interface MeterInputCardProps {
  index: number;
  room: MeterInputRoom;
  control: Control<MeterInputFormValues>;
}

function ConsumptionLine({ reading }: { reading: MeterReading }) {
  return (
    <span
      className={cn(
        "text-xs font-medium tabular-nums",
        reading.status === "anomaly" ? "text-destructive" : "text-primary",
      )}
    >
      Tiêu thụ: {reading.consumption ?? "—"}
    </span>
  );
}

/**
 * One Phòng on "Nhập chỉ số" — the mobile card `renderMeterInputCard` swaps
 * in below `md` (spec #153 §10 row 27, C.1 #10/#12: no eight-column table at
 * 390 px). Same fields, same `useMeterEntryState` as the desktop row.
 */
export default function MeterInputCard({
  index,
  room,
  control,
}: MeterInputCardProps) {
  const { electricity, water, status, approved } = useMeterEntryState(
    control,
    index,
    room,
  );

  return (
    <Card data-slot="meter-input-mobile-card">
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <span className="font-medium">{room.name}</span>
        {status === "anomaly" && !approved ? (
          <StatusBadge config={meterEntryStatusConfig.anomaly} isCompact />
        ) : status === "anomaly" && approved ? (
          <StatusBadge config={meterEntryStatusConfig.approved} isCompact />
        ) : status ? (
          <StatusBadge config={meterEntryStatusConfig[status]} isCompact />
        ) : (
          <Badge variant="outline">Chưa nhập</Badge>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Controller
            name={`rows.${index}.newElectricity`}
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>
                  Điện (cũ: {room.lastElectricity})
                </FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  type="number"
                  min={0}
                  aria-label={`Chỉ số điện mới phòng ${room.name}`}
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
                <ConsumptionLine reading={electricity} />
              </Field>
            )}
          />
          <Controller
            name={`rows.${index}.newWater`}
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>
                  Nước (cũ: {room.lastWater})
                </FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  type="number"
                  min={0}
                  aria-label={`Chỉ số nước mới phòng ${room.name}`}
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
                <ConsumptionLine reading={water} />
              </Field>
            )}
          />
        </div>
        {status === "anomaly" && !approved && (
          <Controller
            name={`rows.${index}.approved`}
            control={control}
            render={({ field }) => (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => field.onChange(true)}
              >
                Duyệt bất thường
              </Button>
            )}
          />
        )}
      </CardContent>
    </Card>
  );
}
