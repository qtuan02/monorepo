import * as z from "zod";

export const batchInvoiceFormSchema = z.object({
  /** `YYYY-MM`, what `MonthField` yields. */
  month: z
    .string()
    .regex(/^\d{4}-\d{2}$/, { error: "Vui lòng chọn kỳ hoá đơn" }),
  selectedContractIds: z
    .array(z.string())
    .min(1, { error: "Vui lòng chọn ít nhất một phòng" }),
});

export type BatchInvoiceFormValues = z.infer<typeof batchInvoiceFormSchema>;
