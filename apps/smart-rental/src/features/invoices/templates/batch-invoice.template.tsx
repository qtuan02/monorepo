import { zodResolver } from "@hookform/resolvers/zod";
import { FileCheck, Send } from "lucide-react";
import { Controller, useForm, useWatch } from "react-hook-form";

import dayjs from "@monorepo/dayjs";
import { Button } from "@monorepo/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@monorepo/ui/components/card";
import { Checkbox } from "@monorepo/ui/components/checkbox";
import { Field, FieldError, FieldLabel } from "@monorepo/ui/components/field";
import { Input } from "@monorepo/ui/components/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@monorepo/ui/components/table";

import type { BatchInvoiceFormValues } from "~/features/invoices/types/batch-invoice-form";
import { ListPageHeader } from "~/components/page/list-page-header";
import { mockBatchInvoiceItems } from "~/constants/mock/invoices";
import { batchInvoiceFormSchema } from "~/features/invoices/types/batch-invoice-form";
import {
  getInvoiceTotal,
  getUtilitySubtotal,
} from "~/features/invoices/utils/invoice-calculations";
import { formatCurrency } from "~/utils/currency";

const FORM_ID = "batch-invoice-form";
const allIds = mockBatchInvoiceItems.map((item) => item.id);

/**
 * "Tạo hóa đơn hàng loạt" — an Đợt hoá đơn: pick the month, tick the Phòng to
 * bill, review the amounts. The prototype pinned the month in copy; here it
 * is a native month input, defaulting to this month. Submit is the
 * prototype's own `TODO` — nothing is created yet.
 */
export default function BatchInvoiceTemplate() {
  const form = useForm<BatchInvoiceFormValues>({
    resolver: zodResolver(batchInvoiceFormSchema),
    defaultValues: {
      // The wire format of <input type="month">, not a display string —
      // `MONTH_FORMAT` is what the same period reads as on screen.
      month: dayjs().format("YYYY-MM"),
      selectedInvoiceIds: allIds,
    },
  });
  const selectedIds = useWatch({
    control: form.control,
    name: "selectedInvoiceIds",
  });
  const isAllSelected = selectedIds.length === allIds.length;

  const toggle = (id: string) =>
    form.setValue(
      "selectedInvoiceIds",
      selectedIds.includes(id)
        ? selectedIds.filter((itemId) => itemId !== id)
        : [...selectedIds, id],
      { shouldValidate: form.formState.isSubmitted },
    );

  const onSubmit = form.handleSubmit((_values) => {
    // TODO: connect API send batch invoices.
  });

  return (
    <div className="space-y-6">
      <ListPageHeader
        title="Tạo hóa đơn hàng loạt"
        description="Lập hóa đơn cho mọi phòng đang thuê trong một kỳ."
        actions={
          <>
            <Button type="button" variant="outline" size="sm">
              <FileCheck />
              Xem trước tất cả
            </Button>
            <Button type="submit" size="sm" form={FORM_ID}>
              <Send />
              Tạo & Gửi {selectedIds.length} hóa đơn
            </Button>
          </>
        }
      />

      <form id={FORM_ID} onSubmit={onSubmit} noValidate className="space-y-6">
        <Controller
          name="month"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid} className="max-w-xs">
              <FieldLabel htmlFor={field.name}>Kỳ hóa đơn</FieldLabel>
              <Input
                {...field}
                id={field.name}
                type="month"
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Card>
          <CardHeader>
            <CardTitle>Xem trước danh sách hóa đơn</CardTitle>
            <CardDescription>
              Kiểm tra lại số tiền trước khi tạo chính thức
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      aria-label="Chọn tất cả"
                      checked={isAllSelected}
                      indeterminate={selectedIds.length > 0 && !isAllSelected}
                      onCheckedChange={(checked) =>
                        form.setValue(
                          "selectedInvoiceIds",
                          checked ? allIds : [],
                          { shouldValidate: form.formState.isSubmitted },
                        )
                      }
                    />
                  </TableHead>
                  <TableHead>Phòng</TableHead>
                  <TableHead>Khách thuê</TableHead>
                  <TableHead>Tiền phòng</TableHead>
                  <TableHead>Điện & Nước</TableHead>
                  <TableHead>Dịch vụ</TableHead>
                  <TableHead className="text-right">Tổng cộng</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockBatchInvoiceItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <Checkbox
                        aria-label={`Chọn phòng ${item.room}`}
                        checked={selectedIds.includes(item.id)}
                        onCheckedChange={() => toggle(item.id)}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{item.room}</TableCell>
                    <TableCell>{item.tenant}</TableCell>
                    <TableCell>{formatCurrency(item.rent)}</TableCell>
                    <TableCell>
                      {formatCurrency(getUtilitySubtotal(item))}
                    </TableCell>
                    <TableCell>{formatCurrency(item.service)}</TableCell>
                    <TableCell className="text-right font-bold tabular-nums">
                      {formatCurrency(getInvoiceTotal(item))}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {form.formState.errors.selectedInvoiceIds && (
              <FieldError
                className="px-6 py-4"
                errors={[form.formState.errors.selectedInvoiceIds]}
              />
            )}
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
