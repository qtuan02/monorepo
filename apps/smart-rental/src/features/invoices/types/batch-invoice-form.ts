import * as z from "zod";

export const batchInvoiceFormSchema = z.object({
  /** `YYYY-MM`, what `<input type="month">` yields. */
  month: z
    .string()
    .regex(/^\d{4}-\d{2}$/, { error: "Vui lòng chọn kỳ hóa đơn" }),
  selectedInvoiceIds: z
    .array(z.string())
    .min(1, { error: "Vui lòng chọn ít nhất một hóa đơn" }),
});

export type BatchInvoiceFormValues = z.infer<typeof batchInvoiceFormSchema>;
