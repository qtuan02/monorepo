import type { Control } from "react-hook-form";
import { useState } from "react";
import { Pencil } from "lucide-react";
import { Controller } from "react-hook-form";

import { Button } from "@monorepo/ui/components/button";
import { Field, FieldError } from "@monorepo/ui/components/field";
import { Input } from "@monorepo/ui/components/input";
import { TableCell } from "@monorepo/ui/components/table";
import { toast } from "@monorepo/ui/components/toast";
import { cn } from "@monorepo/ui/utils/cn";

import type { CycleFormValues } from "~/features/cycles/types/cycle-form";
import type { CycleRow } from "~/types/cycle";
import type { UtilityType } from "~/types/utility";
import { utilityTypeConfig } from "~/constants/status";
import { OldIndexCorrectionSheet } from "~/features/cycles/components/old-index-correction-sheet";
import { useApproveCycleReading } from "~/hooks/api/cycle";

interface MeterGates {
  editable: boolean;
  correctable: boolean;
  approvable: boolean;
}

/**
 * One đồng hồ's three gates — the same at the table and the card (ticket
 * #228, spec #227): `correctable` has no rule broader than `editable`, and
 * `approvable` needs BOTH an anomaly on this đồng hồ AND the row itself at
 * ANOMALY — the table's rule, where the card used to accept a leftover
 * reason alone.
 */
export function meterGates(
  row: CycleRow,
  type: UtilityType,
  readOnly: boolean,
): MeterGates {
  const editable =
    !readOnly && row.status !== "EMPTY" && row.status !== "INVOICED";
  const anomalyReason =
    type === "electricity"
      ? row.electricityAnomalyReason
      : row.waterAnomalyReason;
  const approvable =
    !readOnly && row.status === "ANOMALY" && anomalyReason != null;

  return { editable, correctable: editable, approvable };
}

interface MeterCellProps {
  row: CycleRow;
  type: UtilityType;
  index: number;
  control: Control<CycleFormValues>;
  month: string;
  readOnly: boolean;
  /**
   * `"card"` (default) — the mobile card's own block: pencil + Duyệt inline,
   * unchanged (ticket #228). `"table"` — round 4's `td`-per-value shape
   * (ticket #247): no label, no pencil, no Duyệt — those move to the row's
   * ⋯ menu and Trạng thái cell, which is why `meterGates` stays exported.
   */
  layout?: "card" | "table";
}

/**
 * One đồng hồ (điện hoặc nước) của một Phòng trên "Kỳ điện nước & hoá đơn" —
 * chỉ số cũ, ô nhập chỉ số mới (bind qua `Controller` vào `rows[index]` của
 * form Kỳ), tiêu thụ. Two render shapes share the same `meterGates` (ticket
 * #228 → #247): a card block, and three right-aligned `td`s for the round 4
 * table (header carries "Điện"/"Nước" · "Cũ · Mới · Dùng", so the cell
 * itself states no label).
 */
export function MeterCell({
  row,
  type,
  index,
  control,
  month,
  readOnly,
  layout = "card",
}: MeterCellProps) {
  const [correctionOpen, setCorrectionOpen] = useState(false);
  const approveReading = useApproveCycleReading();
  const { editable, correctable, approvable } = meterGates(row, type, readOnly);
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

  const input = editable && (
    <Controller
      name={fieldName}
      control={control}
      render={({ field, fieldState }) => (
        <Field
          data-invalid={fieldState.invalid}
          className={layout === "table" ? "w-16" : "flex-1"}
        >
          <Input
            {...field}
            type="number"
            min={0}
            aria-label={`Chỉ số ${typeLabel.toLowerCase()} mới phòng ${row.roomName}`}
            aria-invalid={fieldState.invalid}
            className={cn(
              layout === "table"
                ? "text-right"
                : newValue != null && "bg-accent",
              anomalyReason != null && "border-warning",
            )}
          />
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  );

  if (layout === "table") {
    if (row.status === "EMPTY") {
      return (
        <>
          <TableCell className="text-muted-foreground text-right tabular-nums">
            —
          </TableCell>
          <TableCell className="w-16" />
          <TableCell className="text-muted-foreground text-right tabular-nums">
            —
          </TableCell>
        </>
      );
    }

    return (
      <>
        <TableCell className="text-right tabular-nums">{oldValue}</TableCell>
        <TableCell>
          {editable ? (
            input
          ) : (
            <span className="block text-right tabular-nums">
              {newValue ?? "—"}
            </span>
          )}
        </TableCell>
        <TableCell
          className={cn(
            "text-right tabular-nums",
            anomalyReason != null
              ? "text-warning"
              : consumption == null && "text-muted-foreground",
          )}
        >
          {consumption ?? "—"}
        </TableCell>
      </>
    );
  }

  if (row.status === "EMPTY") {
    return <span className="text-muted-foreground tabular-nums">—</span>;
  }

  return (
    <div className="space-y-1.5">
      {correctable && (
        <div className="flex justify-end">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={`Sửa chỉ số ${typeLabel.toLowerCase()} cũ phòng ${row.roomName}`}
            onClick={() => setCorrectionOpen(true)}
          >
            <Pencil />
          </Button>
        </div>
      )}
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground w-12 shrink-0 tabular-nums text-sm">
          {oldValue}
        </span>
        {editable ? (
          input
        ) : (
          <span className="flex-1 tabular-nums text-sm">{newValue ?? "—"}</span>
        )}
        <span className="text-muted-foreground w-16 shrink-0 text-right text-sm tabular-nums">
          {consumption ?? "—"}
        </span>
      </div>
      {approvable && (
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
      {correctable && (
        <OldIndexCorrectionSheet
          open={correctionOpen}
          onOpenChange={setCorrectionOpen}
          roomId={row.roomId}
          roomName={row.roomName}
          type={type}
          month={month}
          currentOldIndex={oldValue}
        />
      )}
    </div>
  );
}
