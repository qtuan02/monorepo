import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";

import dayjs from "@monorepo/dayjs";
import { Field, FieldGroup, FieldLabel } from "@monorepo/ui/components/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@monorepo/ui/components/select";
import { toast } from "@monorepo/ui/components/toast";

import type {
  InvoicePaymentFormInput,
  InvoicePaymentFormValues,
} from "~/features/invoices/types/payment-form";
import { CurrencyField } from "~/components/form/currency-field";
import { DateField } from "~/components/form/date-field";
import { FormSheet } from "~/components/sheet/form-sheet";
import { invoicePaymentMethodConfig } from "~/constants/status";
import { invoicePaymentFormSchema } from "~/features/invoices/types/payment-form";
import { useRecordInvoicePayment } from "~/hooks/api/invoice";

const FORM_ID = "invoice-payment-form";

function defaultValues(): InvoicePaymentFormInput {
  return {
    paidAt: dayjs().format("YYYY-MM-DD"),
    amount: "",
    method: "BANK_TRANSFER",
  };
}

interface PaymentFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoiceId: string;
  invoiceNumber: string;
}

/** "Ghi nhận Thanh toán" (spec #153 §10 row 12) — ngày, số tiền, kênh; trạng thái tự đổi ở lần đọc kế tiếp. */
export default function PaymentFormSheet({
  open,
  onOpenChange,
  invoiceId,
  invoiceNumber,
}: PaymentFormSheetProps) {
  const recordPayment = useRecordInvoicePayment();
  const form = useForm<
    InvoicePaymentFormInput,
    unknown,
    InvoicePaymentFormValues
  >({
    resolver: zodResolver(invoicePaymentFormSchema),
    defaultValues: defaultValues(),
  });

  const onSubmit = form.handleSubmit((values) => {
    recordPayment.mutate(
      { invoiceId, ...values },
      {
        onSuccess: () => {
          toast.add({
            title: `Đã ghi nhận thanh toán cho ${invoiceNumber}`,
            type: "success",
          });
          form.reset(defaultValues());
          onOpenChange(false);
        },
      },
    );
  });

  return (
    <FormSheet
      open={open}
      onOpenChange={(next) => {
        if (next) form.reset(defaultValues());
        onOpenChange(next);
      }}
      title="Ghi nhận Thanh toán"
      description={`Một khoản thu cho ${invoiceNumber}.`}
      formId={FORM_ID}
      onSubmit={onSubmit}
      isDirty={form.formState.isDirty}
      isPending={recordPayment.isPending}
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
