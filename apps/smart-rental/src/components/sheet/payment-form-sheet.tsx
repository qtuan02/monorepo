import { Controller } from "react-hook-form";

import dayjs from "@monorepo/dayjs";
import { Field, FieldGroup, FieldLabel } from "@monorepo/ui/components/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@monorepo/ui/components/select";

import type { InvoicePaymentFormInput } from "~/types/invoice-payment-form";
import { CurrencyField } from "~/components/form/currency-field";
import { DateField } from "~/components/form/date-field";
import { FormSheet } from "~/components/sheet/form-sheet";
import { invoicePaymentMethodConfig } from "~/constants/status";
import { useRecordInvoicePayment } from "~/hooks/api/invoice";
import { useEntityFormSheet } from "~/hooks/use-entity-form-sheet";
import { invoicePaymentFormSchema } from "~/types/invoice-payment-form";

function defaultValues(defaultAmount?: number): InvoicePaymentFormInput {
  return {
    paidAt: dayjs().format("YYYY-MM-DD"),
    amount: defaultAmount ? String(defaultAmount) : "",
    method: "BANK_TRANSFER",
  };
}

interface PaymentFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoiceId: string;
  invoiceNumber: string;
  /** Còn lại — prefills "Số tiền" (spec #179 §"Hôm nay"/"Thu tiền và chi tiết Hoá đơn"). */
  defaultAmount?: number;
}

/**
 * "Ghi nhận Thanh toán" (spec #153 §10 row 12) — ngày, số tiền, kênh; trạng
 * thái tự đổi ở lần đọc kế tiếp. Shared by a Hoá đơn's own detail tab and
 * Hôm nay's grouped Hoá đơn quá hạn mục (see [[architecture-shared-components]]).
 */
export default function PaymentFormSheet({
  open,
  onOpenChange,
  invoiceId,
  invoiceNumber,
  defaultAmount,
}: PaymentFormSheetProps) {
  const recordPayment = useRecordInvoicePayment();
  const { form, sheetProps } = useEntityFormSheet({
    open,
    onOpenChange,
    schema: invoicePaymentFormSchema,
    toDefaultValues: () => defaultValues(defaultAmount),
    mutations: { create: recordPayment },
    toPayload: (values) => ({ invoiceId, ...values }),
    successMessage: () => `Đã ghi nhận thanh toán cho ${invoiceNumber}`,
  });

  return (
    <FormSheet
      {...sheetProps}
      title="Ghi nhận Thanh toán"
      description={`Một khoản thu cho ${invoiceNumber}.`}
    >
      <FieldGroup>
        <DateField
          control={form.control}
          name="paidAt"
          label="Ngày thanh toán"
          required
        />
        <CurrencyField
          control={form.control}
          name="amount"
          label="Số tiền"
          required
        />
        <Controller
          name="method"
          control={form.control}
          render={({ field }) => (
            <Field>
              <FieldLabel htmlFor={field.name}>Kênh thanh toán</FieldLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id={field.name}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(invoicePaymentMethodConfig).map(
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
      </FieldGroup>
    </FormSheet>
  );
}
