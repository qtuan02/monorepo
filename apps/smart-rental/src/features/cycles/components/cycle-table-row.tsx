import type { Control } from "react-hook-form";
import { useState } from "react";
import { Pencil } from "lucide-react";

import { Badge } from "@monorepo/ui/components/badge";
import { Button } from "@monorepo/ui/components/button";
import { TableCell, TableRow } from "@monorepo/ui/components/table";
import { toast } from "@monorepo/ui/components/toast";

import type { EntityActionMenuItem } from "~/components/menu/entity-action-menu";
import type { CycleFormValues } from "~/features/cycles/types/cycle-form";
import type { CycleRow } from "~/types/cycle";
import type { UtilityType } from "~/types/utility";
import { StatusBadge } from "~/components/badge/status-badge";
import { EntityActionMenu } from "~/components/menu/entity-action-menu";
import {
  cycleRowStatusConfig,
  statusTone,
  utilityTypeConfig,
} from "~/constants/status";
import { MeterCell, meterGates } from "~/features/cycles/components/meter-cell";
import { OldIndexCorrectionSheet } from "~/features/cycles/components/old-index-correction-sheet";
import { useApproveCycleReading } from "~/hooks/api/cycle";
import { formatCurrency } from "~/utils/currency";

const METER_TYPES = ["electricity", "water"] as const;

/**
 * "gấp 2,2 lần kỳ trước" → "×2,2" for the Trạng thái badge (round 4, ticket
 * #247, mockup A2) — the ratio is the whole point of a compact badge, the
 * rest of the sentence is what the table's header hai tầng already implies.
 * The one reason with no ratio ("chỉ số bất thường") is shown as-is.
 */
function toCompactAnomalyLabel(reason: string): string {
  const ratio = reason.match(/^gấp ([\d,]+) lần/)?.[1];
  return ratio ? `×${ratio}` : reason;
}

interface CycleTableRowProps {
  index: number;
  row: CycleRow;
  control: Control<CycleFormValues>;
  month: string;
  /** Kỳ đã lập hoặc Kỳ tương lai — no input, no Duyệt, no Sửa chỉ số cũ. */
  readOnly?: boolean;
}

/**
 * One Phòng on "Kỳ điện nước & hoá đơn" — header hai tầng (round 4, ticket
 * #247): two `MeterCell` in `layout="table"` render 3 `td` each (no label,
 * no pencil, no Duyệt), so those three actions move here — "Sửa chỉ số cũ"
 * into the row's ⋯, badge + "Duyệt" into the Trạng thái cell — reusing the
 * same `meterGates` (ticket #228, spec #227) rather than a second rule.
 */
export function CycleTableRow({
  index,
  row,
  control,
  month,
  readOnly = false,
}: CycleTableRowProps) {
  const [correctionType, setCorrectionType] = useState<UtilityType | null>(
    null,
  );
  const approveReading = useApproveCycleReading();

  const gatesByType = {
    electricity: meterGates(row, "electricity", readOnly),
    water: meterGates(row, "water", readOnly),
  };
  const rowEditable = gatesByType.electricity.editable;
  const anomalies = METER_TYPES.map((type) => {
    const reason =
      type === "electricity"
        ? row.electricityAnomalyReason
        : row.waterAnomalyReason;
    return gatesByType[type].approvable && reason ? { type, reason } : null;
  }).filter((anomaly): anomaly is { type: UtilityType; reason: string } =>
    Boolean(anomaly),
  );

  const menuItems: EntityActionMenuItem[] = rowEditable
    ? METER_TYPES.map((type) => ({
        key: type,
        label: `Sửa chỉ số ${utilityTypeConfig[type].label.toLowerCase()} cũ`,
        icon: <Pencil />,
        onClick: () => setCorrectionType(type),
      }))
    : [];

  return (
    <>
      <TableRow className={row.status === "EMPTY" ? "opacity-50" : undefined}>
        <TableCell className="font-medium">{row.roomName}</TableCell>
        <MeterCell
          layout="table"
          row={row}
          type="electricity"
          index={index}
          control={control}
          month={month}
          readOnly={readOnly}
        />
        <MeterCell
          layout="table"
          row={row}
          type="water"
          index={index}
          control={control}
          month={month}
          readOnly={readOnly}
        />
        <TableCell className="text-right tabular-nums">
          {row.status === "EMPTY" ? (
            "—"
          ) : (
            <div className="flex flex-col items-end">
              <span>{formatCurrency(row.rentAmount)}</span>
              {row.rentProrationNote && (
                <span className="text-muted-foreground text-xs">
                  {row.rentProrationNote}
                </span>
              )}
            </div>
          )}
        </TableCell>
        <TableCell className="text-right tabular-nums">
          {row.status === "EMPTY" ? "—" : formatCurrency(row.electricAmount)}
        </TableCell>
        <TableCell className="text-right tabular-nums">
          {row.status === "EMPTY" ? "—" : formatCurrency(row.waterAmount)}
        </TableCell>
        <TableCell className="text-right font-semibold tabular-nums">
          {row.status === "EMPTY" ? "—" : formatCurrency(row.totalAmount)}
        </TableCell>
        <TableCell className="text-right">
          {anomalies.length > 0 ? (
            <div className="flex flex-col items-end gap-1.5">
              {anomalies.map(({ type, reason }) => (
                <div key={type} className="flex items-center gap-1.5">
                  <Badge variant="outline" className={statusTone.warning}>
                    {utilityTypeConfig[type].label}{" "}
                    {toCompactAnomalyLabel(reason)}
                  </Badge>
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
                              title: `Đã duyệt chỉ số ${utilityTypeConfig[type].label.toLowerCase()} phòng ${row.roomName}`,
                              type: "success",
                            }),
                        },
                      )
                    }
                  >
                    Duyệt
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <StatusBadge config={cycleRowStatusConfig[row.status]} isCompact />
          )}
        </TableCell>
        <TableCell>
          {menuItems.length > 0 && (
            <EntityActionMenu
              label={`Thao tác phòng ${row.roomName}`}
              items={menuItems}
            />
          )}
        </TableCell>
      </TableRow>
      {rowEditable && (
        <OldIndexCorrectionSheet
          open={correctionType !== null}
          onOpenChange={(open) => {
            if (!open) setCorrectionType(null);
          }}
          roomId={row.roomId}
          roomName={row.roomName}
          type={correctionType ?? "electricity"}
          month={month}
          currentOldIndex={
            correctionType === "water" ? row.oldWater : row.oldElectricity
          }
        />
      )}
    </>
  );
}
