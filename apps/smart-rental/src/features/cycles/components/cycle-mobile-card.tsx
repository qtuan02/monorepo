import type { Control } from "react-hook-form";
import { useState } from "react";
import { Pencil } from "lucide-react";
import { Controller } from "react-hook-form";

import { Button } from "@monorepo/ui/components/button";
import { Card, CardContent, CardHeader } from "@monorepo/ui/components/card";
import { Field, FieldError } from "@monorepo/ui/components/field";
import { Input } from "@monorepo/ui/components/input";
import { toast } from "@monorepo/ui/components/toast";
import { cn } from "@monorepo/ui/utils/cn";

import type { CycleFormValues } from "~/features/cycles/types/cycle-form";
import type { CycleRow } from "~/types/cycle";
import type { UtilityType } from "~/types/utility";
import { StatusBadge } from "~/components/badge/status-badge";
import { cycleRowStatusConfig, utilityTypeConfig } from "~/constants/status";
import { OldIndexCorrectionSheet } from "~/features/cycles/components/old-index-correction-sheet";
import { useApproveCycleReading } from "~/hooks/api/cycle";
import { formatCurrency } from "~/utils/currency";

interface MeterFieldProps {
  index: number;
  control: Control<CycleFormValues>;
  row: CycleRow;
  type: UtilityType;
  month: string;
  editable: boolean;
  readOnly: boolean;
}

/** One đồng hồ's chỉ số cũ → mới → tiêu thụ, plus its own Sửa/Duyệt actions (ticket #183). */
function MeterField({
  index,
  control,
  row,
  type,
  month,
  editable,
  readOnly,
}: MeterFieldProps) {
  const [correctionOpen, setCorrectionOpen] = useState(false);
  const approveReading = useApproveCycleReading();
  const typeLabel = utilityTypeConfig[type].label;
  const oldValue = type === "electricity" ? row.oldElectricity : row.oldWater;
  const newValue = type === "electricity" ? row.newElectricity : row.newWater;
  const consumption =
    type === "electricity" ? row.electricityConsumption : row.waterConsumption;
  const anomalyReason =
    type === "electricity"
      ? row.electricityAnomalyReason
      : row.waterAnomalyReason;
  const fieldName =
    type === "electricity"
      ? (`rows.${index}.newElectricity` as const)
      : (`rows.${index}.newWater` as const);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground text-xs">{typeLabel}</span>
        {row.status !== "EMPTY" && !readOnly && row.status !== "INVOICED" && (
          <>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label={`Sửa chỉ số ${typeLabel.toLowerCase()} cũ phòng ${row.roomName}`}
              onClick={() => setCorrectionOpen(true)}
            >
              <Pencil />
            </Button>
            <OldIndexCorrectionSheet
              open={correctionOpen}
              onOpenChange={setCorrectionOpen}
              roomId={row.roomId}
              roomName={row.roomName}
              type={type}
              month={month}
              currentOldIndex={oldValue}
            />
          </>
        )}
      </div>
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground w-12 shrink-0 tabular-nums text-sm">
          {row.status === "EMPTY" ? "—" : oldValue}
        </span>
        {editable ? (
          <Controller
            name={fieldName}
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid} className="flex-1">
                <Input
                  {...field}
                  type="number"
                  min={0}
                  aria-label={`Chỉ số ${typeLabel.toLowerCase()} mới phòng ${row.roomName}`}
                  aria-invalid={fieldState.invalid}
                  className={cn(newValue != null && "bg-accent")}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        ) : (
          <span className="flex-1 tabular-nums text-sm">{newValue ?? "—"}</span>
        )}
        <span className="text-muted-foreground w-16 shrink-0 text-right text-sm tabular-nums">
          {consumption ?? "—"}
        </span>
      </div>
      {anomalyReason && !readOnly && (
        <div className="flex items-center justify-between gap-2">
          <span className="text-destructive-foreground-strong text-xs">
            {anomalyReason}
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={approveReading.isPending}
            onClick={() =>
              approveReading.mutate(
                { roomId: row.roomId, type, month },
                {
                  onSuccess: () =>
                    toast.add({
                      title: `Đã duyệt chỉ số ${typeLabel.toLowerCase()} phòng ${row.roomName}`,
                      type: "success",
                    }),
                },
              )
            }
          >
            Duyệt {typeLabel.toLowerCase()}
          </Button>
        </div>
      )}
    </div>
  );
}

interface CycleMobileCardProps {
  index: number;
  row: CycleRow;
  control: Control<CycleFormValues>;
  month: string;
  readOnly?: boolean;
}

/** "Kỳ điện nước & hoá đơn" trên điện thoại — một thẻ/Phòng, ba dòng tiền (ticket #183). */
export function CycleMobileCard({
  index,
  row,
  control,
  month,
  readOnly = false,
}: CycleMobileCardProps) {
  const editable =
    !readOnly && row.status !== "EMPTY" && row.status !== "INVOICED";

  return (
    <Card className={row.status === "EMPTY" ? "opacity-50" : undefined}>
      <CardHeader className="flex-row items-center justify-between gap-2">
        <span className="font-medium">{row.roomName}</span>
        <StatusBadge config={cycleRowStatusConfig[row.status]} isCompact />
      </CardHeader>
      <CardContent className="space-y-4">
        {row.status !== "EMPTY" && (
          <>
            <MeterField
              index={index}
              control={control}
              row={row}
              type="electricity"
              month={month}
              editable={editable}
              readOnly={readOnly}
            />
            <MeterField
              index={index}
              control={control}
              row={row}
              type="water"
              month={month}
              editable={editable}
              readOnly={readOnly}
            />

            <div className="space-y-1 border-t pt-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Tiền phòng</span>
                <span className="tabular-nums">
                  {formatCurrency(row.rentAmount)}
                  {row.rentProrationNote && (
                    <span className="text-muted-foreground ml-1 text-xs">
                      ({row.rentProrationNote})
                    </span>
                  )}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Tiền điện</span>
                <span className="tabular-nums">
                  {formatCurrency(row.electricAmount)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Tiền nước</span>
                <span className="tabular-nums">
                  {formatCurrency(row.waterAmount)}
                </span>
              </div>
              <div className="flex items-center justify-between font-bold">
                <span>Tổng</span>
                <span className="tabular-nums">
                  {formatCurrency(row.totalAmount)}
                </span>
              </div>
            </div>
          </>
        )}
        {row.status !== "ANOMALY" && (
          <p className="text-muted-foreground text-xs">{row.reason}</p>
        )}
      </CardContent>
    </Card>
  );
}
