import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";

import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@monorepo/ui/components/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@monorepo/ui/components/select";
import { toast } from "@monorepo/ui/components/toast";

import type {
  SupplierBillFormInput,
  SupplierBillFormValues,
} from "~/features/supplier-bills/types/supplier-bill-form";
import type { SupplierBill } from "~/types/supplier-bill";
import { AttachmentUrlField } from "~/components/form/attachment-url-field";
import { CurrencyField } from "~/components/form/currency-field";
import { DateField } from "~/components/form/date-field";
import { MonthField } from "~/components/form/month-field";
import { TextField } from "~/components/form/text-field";
import { SelectBuilding } from "~/components/select/select-building";
import { FormSheet } from "~/components/sheet/form-sheet";
import { supplierBillTypeConfig } from "~/constants/status";
import { supplierBillFormSchema } from "~/features/supplier-bills/types/supplier-bill-form";
import {
  useCreateSupplierBill,
  useUpdateSupplierBill,
} from "~/hooks/api/supplier-bill";

interface SupplierBillFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Present → edit this Hoá đơn nhà cung cấp; absent → create a new one. */
  bill?: SupplierBill;
  /** The Building scope already picked — prefills the Combobox on create. */
  defaultBuildingId?: string | null;
}

const FORM_ID = "supplier-bill-form";

function toDefaultValues(
  bill: SupplierBill | undefined,
  defaultBuildingId: string | null | undefined,
): SupplierBillFormInput {
  return {
    buildingId: bill?.buildingId ?? defaultBuildingId ?? "",
    type: bill?.type ?? "electricity",
    supplierName: bill?.supplierName ?? "",
    billingPeriod: bill?.billingPeriod ?? "",
    totalAmount: String(bill?.totalAmount ?? 0),
    paymentDate: bill?.paymentDate ?? "",
    invoiceImageUrl: bill?.invoiceImageUrl ?? "",
  };
}

/**
 * "Tạo/sửa Hoá đơn nhà cung cấp" (spec #153 §10 row 15): one `FormSheet` for
 * both flows, switched by whether `bill` was handed in — the same shape
 * `RoomFormSheet` takes. Trạng thái is never a field here — it stays derived
 * from `paymentDate` (`getSupplierBillPaymentStatus`, ADR-0012).
 */
export default function SupplierBillFormSheet({
  open,
  onOpenChange,
  bill,
  defaultBuildingId,
}: SupplierBillFormSheetProps) {
  const createBill = useCreateSupplierBill();
  const updateBill = useUpdateSupplierBill();
  const isEdit = !!bill;

  const form = useForm<SupplierBillFormInput, unknown, SupplierBillFormValues>({
    resolver: zodResolver(supplierBillFormSchema),
    defaultValues: toDefaultValues(bill, defaultBuildingId),
  });

  const onSubmit = form.handleSubmit((values) => {
    const payload = {
      ...values,
      paymentDate: values.paymentDate || undefined,
      invoiceImageUrl: values.invoiceImageUrl || undefined,
    };

    if (bill) {
      updateBill.mutate(
        { billId: bill.id, ...payload },
        {
          onSuccess: () => {
            toast.add({
              title: "Đã cập nhật hoá đơn nhà cung cấp",
              type: "success",
            });
            onOpenChange(false);
          },
        },
      );
      return;
    }

    createBill.mutate(payload, {
      onSuccess: () => {
        toast.add({ title: "Đã thêm hoá đơn nhà cung cấp", type: "success" });
        form.reset(toDefaultValues(undefined, defaultBuildingId));
        onOpenChange(false);
      },
    });
  });

  return (
    <FormSheet
      open={open}
      onOpenChange={(next) => {
        if (next) form.reset(toDefaultValues(bill, defaultBuildingId));
        onOpenChange(next);
      }}
      title={
        isEdit ? "Chỉnh sửa hoá đơn nhà cung cấp" : "Thêm hoá đơn nhà cung cấp"
      }
      description={
        isEdit ? undefined : "Ghi nhận một khoản chi trả cho nhà cung cấp."
      }
      formId={FORM_ID}
      onSubmit={onSubmit}
      isDirty={form.formState.isDirty}
      isPending={isEdit ? updateBill.isPending : createBill.isPending}
    >
      <FieldGroup>
        <Controller
          name="buildingId"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>
                Toà nhà
                <span aria-hidden className="text-destructive">
                  *
                </span>
              </FieldLabel>
              <SelectBuilding
                id={field.name}
                value={field.value}
                onValueChange={field.onChange}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="type"
          control={form.control}
          render={({ field }) => (
            <Field>
              <FieldLabel htmlFor={field.name}>Loại dịch vụ</FieldLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id={field.name}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(supplierBillTypeConfig).map(
                    ([value, config]) => (
                      <SelectItem key={value} value={value}>
                        {config.label}
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>
            </Field>
          )}
        />

        <TextField
          control={form.control}
          name="supplierName"
          label="Nhà cung cấp"
          required
          placeholder="VD: EVN Đà Nẵng"
        />

        <MonthField
          control={form.control}
          name="billingPeriod"
          label="Kỳ hoá đơn"
          required
        />

        <CurrencyField
          control={form.control}
          name="totalAmount"
          label="Số tiền"
          required
        />

        <DateField
          control={form.control}
          name="paymentDate"
          label="Ngày thanh toán"
          placeholder="Chưa thanh toán"
        />

        <AttachmentUrlField
          control={form.control}
          name="invoiceImageUrl"
          label="Hoá đơn"
        />
      </FieldGroup>
    </FormSheet>
  );
}
