import { zodResolver } from "@hookform/resolvers/zod";
import { Save } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";

import dayjs from "@monorepo/dayjs";
import { Button } from "@monorepo/ui/components/button";
import { Card, CardContent } from "@monorepo/ui/components/card";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@monorepo/ui/components/table";
import { toast } from "@monorepo/ui/components/toast";

import type { MeterInputFormValues } from "~/features/utilities/types/meter-input-form";
import type { MeterReading } from "~/features/utilities/utils/meter-reading";
import type { MeterInputRoom } from "~/types/utility";
import { MonthField } from "~/components/form/month-field";
import { ListPageHeader } from "~/components/page/list-page-header";
import { BuildingScopeRequiredPanel } from "~/components/panel/building-scope-required-panel";
import { CardGridSkeleton } from "~/components/panel/loading-panel";
import MeterInputCard from "~/features/utilities/components/meter-input-card";
import MeterInputRow from "~/features/utilities/components/meter-input-row";
import { meterInputFormSchema } from "~/features/utilities/types/meter-input-form";
import { readMeter } from "~/features/utilities/utils/meter-reading";
import {
  useConfirmMeterReadings,
  useGetMeterInputRooms,
} from "~/hooks/api/utility";
import { useBuildingStore } from "~/stores/use-building-store";

const FORM_ID = "meter-input-form";

interface MonthFormValues {
  month: string;
}

interface MeterEntryRow {
  room: MeterInputRoom;
  type: "electricity" | "water";
  reading: MeterReading;
  approved: boolean;
}

/** One reading per (Phòng, loại) with a non-empty, valid typed value. */
function buildEntryRows(
  rooms: MeterInputRoom[],
  values: MeterInputFormValues["rows"] | undefined,
): MeterEntryRow[] {
  const entries: MeterEntryRow[] = [];
  rooms.forEach((room, index) => {
    const value = values?.[index];
    if (!value) return;
    const electricity = readMeter(
      room.lastElectricity,
      value.newElectricity,
      room.previousElectricityConsumption,
    );
    const water = readMeter(
      room.lastWater,
      value.newWater,
      room.previousWaterConsumption,
    );
    if (electricity.consumption !== null)
      entries.push({
        room,
        type: "electricity",
        reading: electricity,
        approved: value.approved,
      });
    if (water.consumption !== null)
      entries.push({
        room,
        type: "water",
        reading: water,
        approved: value.approved,
      });
  });
  return entries;
}

interface MeterInputFormProps {
  buildingId: string;
  month: string;
  rooms: MeterInputRoom[];
}

/**
 * The rows form for one Toà nhà + kỳ, remounted (via the parent's `key`)
 * whenever either changes — a fresh mount is what gives it fresh
 * `defaultValues` off the just-fetched `rooms`, rather than a manual
 * `form.reset` effect (see `react-effects-sync-only.md`).
 */
function MeterInputForm({ buildingId, month, rooms }: MeterInputFormProps) {
  const confirmMutation = useConfirmMeterReadings();
  const form = useForm<MeterInputFormValues>({
    resolver: zodResolver(meterInputFormSchema),
    defaultValues: {
      rows: rooms.map((room) => ({
        id: room.id,
        newElectricity: "",
        newWater: "",
        approved: false,
      })),
    },
  });
  const watchedRows = useWatch({ control: form.control, name: "rows" });
  const entryRows = buildEntryRows(rooms, watchedRows);
  const hasPendingAnomaly = entryRows.some(
    (entry) => entry.reading.status === "anomaly" && !entry.approved,
  );

  const onSubmit = form.handleSubmit(() => {
    if (hasPendingAnomaly || entryRows.length === 0) return;
    confirmMutation.mutate(
      {
        buildingId,
        month,
        entries: entryRows.map((entry) => {
          const oldIndex =
            entry.type === "electricity"
              ? entry.room.lastElectricity
              : entry.room.lastWater;
          const consumption = entry.reading.consumption ?? 0;
          return {
            roomId: entry.room.id,
            roomName: entry.room.name,
            type: entry.type,
            oldIndex,
            newIndex: oldIndex + consumption,
            consumption,
          };
        }),
      },
      {
        onSuccess: () => {
          toast.add({ title: `Đã lưu ${entryRows.length} chỉ số` });
          form.reset();
        },
      },
    );
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        {hasPendingAnomaly && (
          <p className="text-destructive text-sm">
            Có chỉ số bất thường chưa được duyệt — bấm "Duyệt bất thường" ở dòng
            tương ứng trước khi lưu.
          </p>
        )}
        <Button
          type="submit"
          size="sm"
          form={FORM_ID}
          disabled={
            hasPendingAnomaly ||
            entryRows.length === 0 ||
            confirmMutation.isPending
          }
          className="ml-auto"
        >
          <Save />
          Lưu {entryRows.length} chỉ số
        </Button>
      </div>

      <form id={FORM_ID} onSubmit={onSubmit} noValidate>
        <Card className="hidden md:block">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-24">Phòng</TableHead>
                  <TableHead>Điện cũ</TableHead>
                  <TableHead>Điện mới</TableHead>
                  <TableHead>Tiêu thụ điện</TableHead>
                  <TableHead>Nước cũ</TableHead>
                  <TableHead>Nước mới</TableHead>
                  <TableHead>Tiêu thụ nước</TableHead>
                  <TableHead className="text-right">Trạng thái</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rooms.map((room, index) => (
                  <MeterInputRow
                    key={room.id}
                    index={index}
                    room={room}
                    control={form.control}
                  />
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="grid gap-3 md:hidden">
          {rooms.map((room, index) => (
            <MeterInputCard
              key={room.id}
              index={index}
              room={room}
              control={form.control}
            />
          ))}
        </div>
      </form>
    </div>
  );
}

interface MeterInputRoomsSectionProps {
  buildingId: string;
  month: string;
}

function MeterInputRoomsSection({
  buildingId,
  month,
}: MeterInputRoomsSectionProps) {
  const roomsQuery = useGetMeterInputRooms(buildingId, month);

  if (roomsQuery.isLoading) return <CardGridSkeleton itemCount={1} />;

  return (
    <MeterInputForm
      key={`${buildingId}-${month}`}
      buildingId={buildingId}
      month={month}
      rooms={roomsQuery.data ?? []}
    />
  );
}

/**
 * "Nhập chỉ số điện nước": a Toà nhà (the header's Building scope, required)
 * and a kỳ via `MonthField`, then one row/card per occupied Phòng with a
 * single "Lưu n chỉ số" action (spec #153 §10 row 27).
 */
export default function MeterInputTemplate() {
  const selectedBuildingId = useBuildingStore((s) => s.selectedBuildingId);
  const monthForm = useForm<MonthFormValues>({
    defaultValues: { month: dayjs().format("YYYY-MM") },
  });
  const month = useWatch({ control: monthForm.control, name: "month" });

  return (
    <div className="space-y-6">
      <ListPageHeader
        title="Nhập chỉ số điện nước"
        description="Chọn kỳ, sau đó nhập điện và nước cho từng Phòng."
      />

      <div className="max-w-xs">
        <MonthField
          control={monthForm.control}
          name="month"
          label="Kỳ"
          required
        />
      </div>

      {!selectedBuildingId ? (
        <BuildingScopeRequiredPanel description="Nhập chỉ số áp dụng cho đúng một Toà nhà — chọn Toà nhà ở thanh phía trên." />
      ) : (
        <MeterInputRoomsSection buildingId={selectedBuildingId} month={month} />
      )}
    </div>
  );
}
