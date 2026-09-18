import * as z from "zod";

// Whole-number money field arrives from the currency input as a string, same
// shape as roomFormSchema / expenseFormSchema.
const wholeNumber = (error: string) =>
  z
    .string()
    .trim()
    .min(1, { error })
    .pipe(z.coerce.number<string>({ error }).int({ error }));

/**
 * "Tạo/sửa Hoá đơn nhà cung cấp" (spec #153 §10 row 15): a short `FormSheet` —
 * Toà nhà (Combobox), loại dịch vụ, nhà cung cấp, kỳ hoá đơn (`MonthField`),
 * số tiền, ngày thanh toán (optional — absent means chưa thanh toán, see
 * `getSupplierBillPaymentStatus`), ảnh hoá đơn (a URL — no upload backend
 * yet).
 */
export const supplierBillFormSchema = z.object({
  buildingId: z
    .string({ error: "Chọn một toà nhà" })
    .trim()
    .min(1, { error: "Chọn một toà nhà" }),
  type: z.enum(["electricity", "water", "trash", "internet", "other"], {
    error: "Chọn loại dịch vụ",
  }),
  supplierName: z
    .string({ error: "Nhập tên nhà cung cấp" })
    .trim()
    .min(1, { error: "Nhập tên nhà cung cấp" }),
  billingPeriod: z
    .string({ error: "Chọn kỳ hoá đơn" })
    .min(1, { error: "Chọn kỳ hoá đơn" }),
  totalAmount: wholeNumber("Bắt buộc, tối thiểu 1đ").pipe(
    z.number().min(1, { error: "Bắt buộc, tối thiểu 1đ" }),
  ),
  paymentDate: z.string().trim().optional(),
  invoiceImageUrl: z.string().trim().optional(),
});

export type SupplierBillFormInput = z.input<typeof supplierBillFormSchema>;
export type SupplierBillFormValues = z.output<typeof supplierBillFormSchema>;
