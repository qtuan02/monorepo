import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Receipt,
  Save,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router";

import dayjs from "@monorepo/dayjs";
import { useIsMobile } from "@monorepo/hook/use-is-mobile";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@monorepo/ui/components/alert";
import { Button, buttonVariants } from "@monorepo/ui/components/button";
import { Card, CardContent } from "@monorepo/ui/components/card";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@monorepo/ui/components/table";
import { toast } from "@monorepo/ui/components/toast";

import type { CycleFormValues } from "~/features/cycles/types/cycle-form";
import type { CycleRow } from "~/types/cycle";
import type { UtilityType } from "~/types/utility";
import { ListPageHeader } from "~/components/page/list-page-header";
import { BuildingScopeRequiredPanel } from "~/components/panel/building-scope-required-panel";
import { ErrorPanel } from "~/components/panel/error-panel";
import { CardGridSkeleton } from "~/components/panel/loading-panel";
import { ROUTES } from "~/constants/routes";
import { ELECTRICITY_PRICE_CAP_PER_KWH } from "~/constants/tariff";
import { CycleMobileCard } from "~/features/cycles/components/cycle-mobile-card";
import { CycleTableRow } from "~/features/cycles/components/cycle-table-row";
import {
  buildCycleFormSchema,
  parseNewIndex,
} from "~/features/cycles/types/cycle-form";
import { useGetBuilding } from "~/hooks/api/building";
import {
  useCreateCycleInvoices,
  useGetCycleRows,
  useSaveCycleReadings,
} from "~/hooks/api/cycle";
import { useBuildingStore } from "~/stores/use-building-store";
import { formatCurrency } from "~/utils/currency";
import { isCycleClosingDatePassed, isFutureCycle } from "~/utils/cycle-rows";
import { formatDate, formatMonth } from "~/utils/date";
import { isElectricityPriceOverCap } from "~/utils/tariff";

const FORM_ID = "cycle-form";

interface CycleFormProps {
  buildingId: string;
  month: string;
  rows: CycleRow[];
}

/**
 * The Kỳ table for one Toà nhà + kỳ, remounted (via the parent's `key`)
 * whenever either changes — a fresh mount is what gives it fresh
 * `defaultValues` off the just-fetched `rows` (see
 * `meter-input.template.tsx`'s own note on this shape, now folded in here).
 * A kỳ that already has a Hoá đơn, or hasn't started yet, renders `readOnly`
 * (ticket #183, ADR-0013) — no input, no Duyệt, no Sửa chỉ số cũ, no action bar.
 */
function CycleForm({ buildingId, month, rows }: CycleFormProps) {
  const isMobile = useIsMobile();
  const saveReadings = useSaveCycleReadings();
  const createInvoices = useCreateCycleInvoices();
  const readOnly =
    rows.some((row) => row.status === "INVOICED") || isFutureCycle(month);
  const form = useForm<CycleFormValues>({
    resolver: zodResolver(buildCycleFormSchema(rows)),
    defaultValues: {
      rows: rows.map((row) => ({
        roomId: row.roomId,
        newElectricity:
          row.newElectricity != null ? String(row.newElectricity) : "",
        newWater: row.newWater != null ? String(row.newWater) : "",
      })),
    },
  });

  const readyCount = rows.filter((row) => row.status === "READY").length;
  const anomalyCount = rows.filter((row) => row.status === "ANOMALY").length;
  const emptyCount = rows.filter((row) => row.status === "EMPTY").length;
  const closingDate = dayjs(month, "YYYY-MM").endOf("month").toDate();
  const closingPassed = isCycleClosingDatePassed(month);
  const createDisabled = readyCount === 0 || !closingPassed;
  const helperText = [
    `Chỉ lập được từ ${formatDate(closingDate)}`,
    `${readyCount}/${rows.length} sẵn sàng`,
    anomalyCount > 0 && `${anomalyCount} bất thường`,
    emptyCount > 0 && `${emptyCount} trống`,
  ]
    .filter(Boolean)
    .join(" · ");

  const onSaveDraft = form.handleSubmit((values) => {
    const entries: {
      roomId: string;
      roomName: string;
      type: UtilityType;
      oldIndex: number;
      newIndex: number;
      consumption: number;
    }[] = [];

    rows.forEach((row, index) => {
      if (!row.contractId || row.status === "INVOICED") return;
      const value = values.rows[index];
      if (!value) return;

      const newElectricity = parseNewIndex(value.newElectricity);
      if (newElectricity !== null) {
        entries.push({
          roomId: row.roomId,
          roomName: row.roomName,
          type: "electricity",
          oldIndex: row.oldElectricity,
          newIndex: newElectricity,
          consumption: newElectricity - row.oldElectricity,
        });
      }

      const newWater = parseNewIndex(value.newWater);
      if (newWater !== null) {
        entries.push({
          roomId: row.roomId,
          roomName: row.roomName,
          type: "water",
          oldIndex: row.oldWater,
          newIndex: newWater,
          consumption: newWater - row.oldWater,
        });
      }
    });

    if (entries.length === 0) return;
    saveReadings.mutate(
      { buildingId, month, entries },
      {
        onSuccess: () =>
          toast.add({ title: `Đã lưu nháp ${entries.length} chỉ số` }),
      },
    );
  });

  const onCreateInvoices = () => {
    createInvoices.mutate(
      { buildingId, month },
      {
        onSuccess: (created) =>
          toast.add({
            title: `Đã lập ${created.length} hoá đơn`,
            type: "success",
          }),
      },
    );
  };

  return (
    <div className="space-y-4">
      {readOnly ? (
        <p className="text-muted-foreground text-right text-sm">
          {isFutureCycle(month)
            ? "Kỳ tương lai — chưa mở."
            : "Kỳ này đã lập hoá đơn — chỉ xem lại."}
        </p>
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-muted-foreground text-sm">{helperText}</p>
          <div className="flex items-center gap-2">
            <Button
              type="submit"
              form={FORM_ID}
              variant="outline"
              size="sm"
              disabled={saveReadings.isPending}
            >
              <Save />
              Lưu nháp chỉ số
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={createDisabled || createInvoices.isPending}
              onClick={onCreateInvoices}
            >
              <Receipt />
              Lập {readyCount} hoá đơn
            </Button>
          </div>
        </div>
      )}

      <form id={FORM_ID} onSubmit={onSaveDraft} noValidate>
        {isMobile ? (
          <div className="grid gap-3">
            {rows.map((row, index) => (
              <CycleMobileCard
                key={row.roomId}
                index={index}
                row={row}
                control={form.control}
                month={month}
                readOnly={readOnly}
              />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="overflow-x-auto p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead rowSpan={2} className="w-24 align-bottom">
                      Phòng
                    </TableHead>
                    <TableHead colSpan={3} className="text-center">
                      Điện (kWh)
                    </TableHead>
                    <TableHead colSpan={3} className="text-center">
                      Nước (m³)
                    </TableHead>
                    <TableHead
                      rowSpan={2}
                      aria-label="Tiền phòng"
                      className="text-right align-bottom"
                    >
                      Phòng
                    </TableHead>
                    <TableHead
                      rowSpan={2}
                      aria-label="Tiền điện"
                      className="text-right align-bottom"
                    >
                      Điện
                    </TableHead>
                    <TableHead
                      rowSpan={2}
                      aria-label="Tiền nước"
                      className="text-right align-bottom"
                    >
                      Nước
                    </TableHead>
                    <TableHead rowSpan={2} className="text-right align-bottom">
                      Tổng
                    </TableHead>
                    <TableHead rowSpan={2} className="text-right align-bottom">
                      Trạng thái
                    </TableHead>
                    <TableHead rowSpan={2} className="w-9 align-bottom" />
                  </TableRow>
                  <TableRow>
                    <TableHead className="text-right">Cũ</TableHead>
                    <TableHead className="text-right">Mới</TableHead>
                    <TableHead className="text-right">Dùng</TableHead>
                    <TableHead className="text-right">Cũ</TableHead>
                    <TableHead className="text-right">Mới</TableHead>
                    <TableHead className="text-right">Dùng</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((row, index) => (
                    <CycleTableRow
                      key={row.roomId}
                      index={index}
                      row={row}
                      control={form.control}
                      month={month}
                      readOnly={readOnly}
                    />
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </form>
    </div>
  );
}

interface CycleRowsSectionProps {
  buildingId: string;
  month: string;
}

function CycleRowsSection({ buildingId, month }: CycleRowsSectionProps) {
  const rowsQuery = useGetCycleRows(buildingId, month);

  if (rowsQuery.isLoading) return <CardGridSkeleton itemCount={1} />;
  if (rowsQuery.isError) {
    return (
      <ErrorPanel
        description="Không tải được dữ liệu của kỳ."
        action={{ label: "Thử lại", onClick: () => rowsQuery.refetch() }}
      />
    );
  }

  return (
    <CycleForm
      key={`${buildingId}-${month}`}
      buildingId={buildingId}
      month={month}
      rows={rowsQuery.data ?? []}
    />
  );
}

interface CycleTemplateProps {
  /** `YYYY-MM`, declared on the route path — always present when this renders. */
  month: string;
}

/**
 * "Kỳ điện nước & hoá đơn" (`/cycles/:month`, ADR-0013) — one Toà nhà, the
 * whole chuỗi tháng in one screen: chỉ số cũ (đọc), chỉ số mới điền sẵn
 * Nháp, tiêu thụ, tiền theo Bảng giá của Toà nhà, trạng thái hàng, rồi
 * "Lưu nháp chỉ số" và "Lập n hoá đơn". Replaces the old Đợt hoá đơn +
 * Nhập chỉ số screens (spec #182).
 */
export default function CycleTemplate({ month }: CycleTemplateProps) {
  const navigate = useNavigate();
  const selectedBuildingId = useBuildingStore((s) => s.selectedBuildingId);
  const buildingQuery = useGetBuilding(selectedBuildingId ?? "", {
    enabled: !!selectedBuildingId,
  });
  const building = buildingQuery.data;

  const previousMonth = dayjs(month, "YYYY-MM")
    .subtract(1, "month")
    .format("YYYY-MM");
  const nextMonth = dayjs(month, "YYYY-MM").add(1, "month").format("YYYY-MM");
  const nextDisabled = isFutureCycle(nextMonth);

  return (
    <div className="space-y-6">
      <ListPageHeader
        title={
          building
            ? `Kỳ ${formatMonth(month)} · ${building.name}`
            : "Kỳ điện nước & hoá đơn"
        }
        description={
          building
            ? `Bảng giá: ${formatCurrency(building.priceList.electricityPricePerKwh)}/kWh điện · ${formatCurrency(building.priceList.waterPricePerM3)}/m³ nước · ${formatCurrency(building.priceList.serviceFee)} dịch vụ`
            : "Chốt chỉ số điện nước và lập hoá đơn cho các Phòng đủ điều kiện của kỳ."
        }
        actions={
          <>
            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                aria-label={`Kỳ trước, ${formatMonth(previousMonth)}`}
                onClick={() => navigate(ROUTES.cycleDetailPath(previousMonth))}
              >
                <ChevronLeft />
              </Button>
              <span className="w-20 text-center text-sm font-medium tabular-nums">
                {formatMonth(month)}
              </span>
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                aria-label={`Kỳ sau, ${formatMonth(nextMonth)}`}
                disabled={nextDisabled}
                onClick={() => navigate(ROUTES.cycleDetailPath(nextMonth))}
              >
                <ChevronRight />
              </Button>
            </div>
            <Link
              to={ROUTES.UTILITIES}
              aria-label="Xem các Kỳ trước"
              className={buttonVariants({
                variant: "outline",
                size: "icon-sm",
              })}
            >
              <MoreHorizontal />
            </Link>
          </>
        }
      />

      {building &&
        isElectricityPriceOverCap(
          building.priceList.electricityPricePerKwh,
        ) && (
          <Alert variant="destructive">
            <AlertTriangle />
            <AlertTitle>Vượt trần giá điện cho người thuê</AlertTitle>
            <AlertDescription>
              Trần theo quy định hiện hành là{" "}
              {formatCurrency(ELECTRICITY_PRICE_CAP_PER_KWH)}/kWh.{" "}
              <Link
                to={`${ROUTES.buildingDetailPath(building.id)}?tab=settings`}
                className="underline"
              >
                Sửa giá
              </Link>
              .
            </AlertDescription>
          </Alert>
        )}

      {!selectedBuildingId ? (
        <BuildingScopeRequiredPanel description="Kỳ áp dụng cho đúng một Toà nhà — chọn Toà nhà ở thanh phía trên." />
      ) : buildingQuery.isLoading || !building ? (
        <CardGridSkeleton itemCount={1} />
      ) : (
        <CycleRowsSection buildingId={selectedBuildingId} month={month} />
      )}
    </div>
  );
}
