import type { Control } from "react-hook-form";
import { Controller } from "react-hook-form";

import { Field, FieldError } from "@monorepo/ui/components/field";
import { Input } from "@monorepo/ui/components/input";
import { TableCell, TableRow } from "@monorepo/ui/components/table";
import { cn } from "@monorepo/ui/utils/cn";

import type { CycleFormValues } from "~/features/cycles/types/cycle-form";
import type { CycleRow } from "~/types/cycle";
import { StatusBadge } from "~/components/badge/status-badge";
import { cycleRowStatusConfig } from "~/constants/status";
import { formatCurrency } from "~/utils/currency";

interface CycleTableRowProps {
  index: number;
  row: CycleRow;
  control: Control<CycleFormValues>;
}

/**
 * One Phòng on "Kỳ điện nước & hoá đơn" (ADR-0013) — the chỉ số mới field is
 * editable and pre-filled from the kỳ's own Nháp (accent background) only
 * for a Phòng that has a Hợp đồng hiệu lực and isn't already invoiced;
 * `EMPTY`/`INVOICED` rows show their own values read-only.
 */
export function CycleTableRow({ index, row, control }: CycleTableRowProps) {
  const editable = row.status !== "EMPTY" && row.status !== "INVOICED";

  return (
    <TableRow className={row.status === "EMPTY" ? "opacity-50" : undefined}>
      <TableCell className="font-medium">{row.roomName}</TableCell>
      <TableCell className="text-muted-foreground tabular-nums">
        {row.status === "EMPTY" ? "—" : row.oldElectricity}
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
      <TableCell className="text-muted-foreground tabular-nums">
        {row.status === "EMPTY" ? "—" : row.oldWater}
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
        {row.status === "EMPTY" ? "—" : formatCurrency(row.rentAmount)}
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
        <div className="flex flex-col items-end gap-1">
          <StatusBadge config={cycleRowStatusConfig[row.status]} isCompact />
          <span className="text-muted-foreground text-xs">{row.reason}</span>
        </div>
      </TableCell>
    </TableRow>
  );
}
