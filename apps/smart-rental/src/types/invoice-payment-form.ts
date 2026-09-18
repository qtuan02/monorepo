import * as z from "zod";

// Number inputs hand over strings: string in, number out (the building form's shape).
const positiveNumber = (error: string) =>
  z
    .string()
    .trim()
    .min(1, { error })
    .pipe(z.coerce.number<string>({ error }).positive({ error }));

/** "Ghi nhận Thanh toán" (spec #153 §10 row 12): ngày, số tiền, kênh. */
export const invoicePaymentFormSchema = z.object({
  paidAt: z.string().min(1, { error: "Vui lòng chọn ngày thanh toán" }),
  amount: positiveNumber("Vui lòng nhập số tiền"),
  method: z.enum(["BANK_TRANSFER", "CASH", "VIETQR"], {
    error: "Vui lòng chọn kênh thanh toán",
  }),
});

export type InvoicePaymentFormInput = z.input<typeof invoicePaymentFormSchema>;
export type InvoicePaymentFormValues = z.output<
  typeof invoicePaymentFormSchema
>;
