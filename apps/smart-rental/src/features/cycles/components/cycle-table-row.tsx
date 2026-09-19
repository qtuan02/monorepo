import type { Control } from "react-hook-form";

import { TableCell, TableRow } from "@monorepo/ui/components/table";

import type { CycleFormValues } from "~/features/cycles/types/cycle-form";
import type { CycleRow } from "~/types/cycle";
import { StatusBadge } from "~/components/badge/status-badge";
import { cycleRowStatusConfig } from "~/constants/status";
import { MeterCell } from "~/features/cycles/components/meter-cell";
import { formatCurrency } from "~/utils/currency";

interface CycleTableRowProps {
  index: number;
  row: CycleRow;
  control: Control<CycleFormValues>;
  month: string;
  /** Kỳ đã lập hoặc Kỳ tương lai — no input, no Duyệt, no Sửa chỉ số cũ. */
  readOnly?: boolean;
}

/**
 * One Phòng on "Kỳ điện nước & hoá đơn" (ADR-0013) — layout only: two
 * `MeterCell` (điện, nước) beside the money cells, each owning its own three
 * gates (ticket #228, spec #227).
 */
export function CycleTableRow({
  index,
  row,
  control,
  month,
  readOnly = false,
}: CycleTableRowProps) {
  return (
    <TableRow className={row.status === "EMPTY" ? "opacity-50" : undefined}>
      <TableCell className="font-medium">{row.roomName}</TableCell>
      <TableCell>
        <MeterCell
          row={row}
          type="electricity"
          index={index}
          control={control}
          month={month}
          readOnly={readOnly}
        />
      </TableCell>
      <TableCell>
        <MeterCell
          row={row}
          type="water"
          index={index}
          control={control}
          month={month}
          readOnly={readOnly}
        />
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
          <span className="text-muted-foreground text-xs">{row.reason}</span>
        </div>
      </TableCell>
    </TableRow>
  );
}
