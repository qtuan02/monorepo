import { zodResolver } from "@hookform/resolvers/zod";
import { Calculator, Save } from "lucide-react";
import { useForm } from "react-hook-form";

import { Button } from "@monorepo/ui/components/button";
import { Card, CardContent } from "@monorepo/ui/components/card";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@monorepo/ui/components/table";

import type { MeterInputFormValues } from "~/features/utilities/types/meter-input-form";
import { ListPageHeader } from "~/components/page/list-page-header";
import { mockMeterInputRooms } from "~/constants/mock/utilities";
import MeterInputRow from "~/features/utilities/components/meter-input-row";
import { meterInputFormSchema } from "~/features/utilities/types/meter-input-form";

const FORM_ID = "meter-input-form";

/**
 * "Nhập chỉ số điện nước": one row per Phòng, last month's readings beside
 * this month's inputs. The rows are the Mock (no `useFieldArray`: nothing is
 * added or removed, so the Mock's own order is the array's). Submit is the
 * prototype's own `TODO` — nothing is saved yet.
 */
export default function MeterInputTemplate() {
  const form = useForm<MeterInputFormValues>({
    resolver: zodResolver(meterInputFormSchema),
    defaultValues: {
      rows: mockMeterInputRooms.map((room) => ({
        ...room,
        newElectricity: "",
        newWater: "",
      })),
    },
  });

  const onSubmit = form.handleSubmit((_values) => {
    // TODO: connect API for meter saving/calculation.
  });

  return (
    <div className="space-y-6">
      <ListPageHeader
        title="Nhập chỉ số điện nước"
        description="Kỳ hóa đơn: Tháng 10/2023"
        actions={
          <>
            <Button type="submit" variant="outline" size="sm" form={FORM_ID}>
              <Calculator />
              Tính toán hóa đơn
            </Button>
            <Button type="submit" size="sm" form={FORM_ID}>
              <Save />
              Lưu chỉ số
            </Button>
          </>
        }
      />

      <form id={FORM_ID} onSubmit={onSubmit} noValidate>
        <Card>
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
                {mockMeterInputRooms.map((room, index) => (
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
      </form>
    </div>
  );
}
