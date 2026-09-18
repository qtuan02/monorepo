import type { Control } from "react-hook-form";
import { useState } from "react";
import { Pencil } from "lucide-react";
import { Controller } from "react-hook-form";

import { Button } from "@monorepo/ui/components/button";
import { Field, FieldError } from "@monorepo/ui/components/field";
import { Input } from "@monorepo/ui/components/input";
import { TableCell, TableRow } from "@monorepo/ui/components/table";
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

interface CycleTableRowProps {
  index: number;
  row: CycleRow;
  control: Control<CycleFormValues>;
  month: string;
  /** Kỳ đã lập hoặc Kỳ tương lai — no input, no Duyệt, no Sửa chỉ số cũ. */
  readOnly?: boolean;
}

interface OldIndexCellProps {
  roomId: string;
  roomName: string;
  type: UtilityType;
  month: string;
  value: number;
  disabled: boolean;
}

/** One đọc-only chỉ số cũ cell + its own "Sửa chỉ số cũ" trigger (ticket #183). */
function OldIndexCell({
  roomId,
  roomName,
  type,
  month,
  value,
  disabled,
}: OldIndexCellProps) {
  const [open, setOpen] = useState(false);
  const typeLabel = utilityTypeConfig[type].label;

  return (
    <div className="flex items-center gap-1">
      <span className="text-muted-foreground tabular-nums">{value}</span>
      {!disabled && (
        <>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={`Sửa chỉ số ${typeLabel.toLowerCase()} cũ phòng ${roomName}`}
            onClick={() => setOpen(true)}
          >
            <Pencil />
          </Button>
          <OldIndexCorrectionSheet
            open={open}
            onOpenChange={setOpen}
            roomId={roomId}
            roomName={roomName}
            type={type}
            month={month}
            currentOldIndex={value}
          />
        </>
      )}
    </div>
  );
}

interface ApproveButtonProps {
  roomId: string;
  roomName: string;
  type: UtilityType;
  month: string;
  reason: string;
}

/** "Duyệt điện" / "Duyệt nước" — one đồng hồ at a time (ticket #183). */
function ApproveButton({
  roomId,
  roomName,
  type,
  month,
  reason,
}: ApproveButtonProps) {
  const approveReading = useApproveCycleReading();
  const typeLabel = utilityTypeConfig[type].label;

  return (
    <div className="flex flex-col items-start gap-1">
      <span className="text-destructive-foreground-strong text-xs">
        {typeLabel} {reason}
      </span>
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={approveReading.isPending}
        onClick={() =>
          approveReading.mutate(
            { roomId, type, month },
            {
              onSuccess: () =>
                toast.add({
                  title: `Đã duyệt chỉ số ${typeLabel.toLowerCase()} phòng ${roomName}`,
                  type: "success",
                }),
            },
          )
        }
      >
        Duyệt {typeLabel.toLowerCase()}
      </Button>
    </div>
  );
}

/**
 * One Phòng on "Kỳ điện nước & hoá đơn" (ADR-0013) — the chỉ số mới field is
 * editable and pre-filled from the kỳ's own Nháp (accent background) only
 * for a Phòng that has a Hợp đồng hiệu lực and isn't already invoiced;
 * `EMPTY`/`INVOICED` rows show their own values read-only. A row whose kỳ is
 * `readOnly` (đã lập hoặc tương lai, ticket #183) never edits either.
 */
export function CycleTableRow({
  index,
  row,
  control,
  month,
  readOnly = false,
}: CycleTableRowProps) {
  const editable =
    !readOnly && row.status !== "EMPTY" && row.status !== "INVOICED";

  return (
    <TableRow className={row.status === "EMPTY" ? "opacity-50" : undefined}>
      <TableCell className="font-medium">{row.roomName}</TableCell>
      <TableCell>
        {row.status === "EMPTY" ? (
          <span className="text-muted-foreground tabular-nums">—</span>
        ) : (
          <OldIndexCell
            roomId={row.roomId}
            roomName={row.roomName}
            type="electricity"
            month={month}
            value={row.oldElectricity}
            disabled={readOnly || row.status === "INVOICED"}
          />
        )}
      </TableCell>
      <TableCell>
        {editable ? (
          <Controller
            name={`rows.${index}.newElectricity`}
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid} className="w-24">
                <Input
                  {...field}
                  type="number"
                  min={0}
                  aria-label={`Chỉ số điện mới phòng ${row.roomName}`}
                  aria-invalid={fieldState.invalid}
                  className={cn(row.newElectricity != null && "bg-accent")}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        ) : (
          <span className="tabular-nums">{row.newElectricity ?? "—"}</span>
        )}
      </TableCell>
      <TableCell className="tabular-nums">
        {row.electricityConsumption ?? "—"}
      </TableCell>
      <TableCell>
        {row.status === "EMPTY" ? (
          <span className="text-muted-foreground tabular-nums">—</span>
        ) : (
          <OldIndexCell
            roomId={row.roomId}
            roomName={row.roomName}
            type="water"
            month={month}
            value={row.oldWater}
            disabled={readOnly || row.status === "INVOICED"}
          />
        )}
      </TableCell>
      <TableCell>
        {editable ? (
          <Controller
            name={`rows.${index}.newWater`}
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid} className="w-24">
                <Input
                  {...field}
                  type="number"
                  min={0}
                  aria-label={`Chỉ số nước mới phòng ${row.roomName}`}
                  aria-invalid={fieldState.invalid}
                  className={cn(row.newWater != null && "bg-accent")}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        ) : (
          <span className="tabular-nums">{row.newWater ?? "—"}</span>
        )}
      </TableCell>
      <TableCell className="tabular-nums">
        {row.waterConsumption ?? "—"}
      </TableCell>
      <TableCell className="tabular-nums">
        {row.status === "EMPTY" ? (
          "—"
        ) : (
          <div className="flex flex-col">
            <span>{formatCurrency(row.rentAmount)}</span>
            {row.rentProrationNote && (
              <span className="text-muted-foreground text-xs">
                {row.rentProrationNote}
              </span>
            )}
          </div>
        )}
      </TableCell>
      <TableCell className="tabular-nums">
        {row.status === "EMPTY" ? "—" : formatCurrency(row.electricAmount)}
      </TableCell>
      <TableCell className="tabular-nums">
        {row.status === "EMPTY" ? "—" : formatCurrency(row.waterAmount)}
      </TableCell>
      <TableCell className="text-right font-bold tabular-nums">
        {row.status === "EMPTY" ? "—" : formatCurrency(row.totalAmount)}
      </TableCell>
      <TableCell className="text-right">
        <div className="flex flex-col items-end gap-1.5">
          <StatusBadge config={cycleRowStatusConfig[row.status]} isCompact />
          {row.status === "ANOMALY" && !readOnly ? (
            <div className="flex flex-col items-end gap-1.5">
              {row.electricityAnomalyReason && (
                <ApproveButton
                  roomId={row.roomId}
                  roomName={row.roomName}
                  type="electricity"
                  month={month}
                  reason={row.electricityAnomalyReason}
                />
              )}
              {row.waterAnomalyReason && (
                <ApproveButton
                  roomId={row.roomId}
                  roomName={row.roomName}
                  type="water"
                  month={month}
                  reason={row.waterAnomalyReason}
                />
              )}
            </div>
          ) : (
            <span className="text-muted-foreground text-xs">{row.reason}</span>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}
