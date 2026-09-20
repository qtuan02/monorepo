import type { Control } from "react-hook-form";

import { Card, CardContent, CardHeader } from "@monorepo/ui/components/card";

import type { CycleFormValues } from "~/features/cycles/types/cycle-form";
import type { CycleRow } from "~/types/cycle";
import { StatusBadge } from "~/components/badge/status-badge";
import { cycleRowStatusConfig } from "~/constants/status";
import { MeterCell } from "~/features/cycles/components/meter-cell";
import { formatCurrency } from "~/utils/currency";

interface CycleMobileCardProps {
  index: number;
  row: CycleRow;
  control: Control<CycleFormValues>;
  month: string;
  readOnly?: boolean;
}

/**
 * "Kỳ điện nước & hoá đơn" trên điện thoại — layout only: two `MeterCell`
 * (điện, nước) beside the money rows, each owning its own three gates
 * (ticket #228, spec #227).
 */
export function CycleMobileCard({
  index,
  row,
  control,
  month,
  readOnly = false,
}: CycleMobileCardProps) {
  return (
    <Card className={row.status === "EMPTY" ? "opacity-50" : undefined}>
      <CardHeader className="flex-row items-center justify-between gap-2">
        <span className="font-medium">{row.roomName}</span>
        <StatusBadge config={cycleRowStatusConfig[row.status]} isCompact />
      </CardHeader>
      <CardContent className="space-y-4">
        {row.status !== "EMPTY" && (
          <>
            <MeterCell
              row={row}
              type="electricity"
              index={index}
              control={control}
              month={month}
              readOnly={readOnly}
            />
            <MeterCell
              row={row}
              type="water"
              index={index}
              control={control}
              month={month}
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
        <p className="text-muted-foreground text-xs">{row.reason}</p>
      </CardContent>
    </Card>
  );
}
