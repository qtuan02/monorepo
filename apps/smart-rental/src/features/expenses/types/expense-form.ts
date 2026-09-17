import * as z from "zod";

// Whole-number money field arrives from the currency input as a string, same
// shape as roomFormSchema / buildingSettingsFormSchema.
const wholeNumber = (error: string) =>
  z
    .string()
    .trim()
    .min(1, { error })
    .pipe(z.coerce.number<string>({ error }).int({ error }));

/**
 * "Tạo/sửa Chi phí" (spec #153 §10 row 15): a short `FormSheet` — Toà nhà
 * (Combobox), danh mục (free text — the prototype never made it an enum),
 * số tiền, ngày chi, mô tả, ảnh biên lai (a URL — no upload backend yet).
 */
export const expenseFormSchema = z.object({
  buildingId: z
    .string({ error: "Chọn một toà nhà" })
    .trim()
    .min(1, { error: "Chọn một toà nhà" }),
  category: z
    .string({ error: "Nhập danh mục" })
    .trim()
    .min(1, { error: "Nhập danh mục" }),
  amount: wholeNumber("Bắt buộc, tối thiểu 1đ").pipe(
    z.number().min(1, { error: "Bắt buộc, tối thiểu 1đ" }),
  ),
  expenseDate: z
    .string({ error: "Chọn ngày chi" })
    .min(1, { error: "Chọn ngày chi" }),
  description: z.string().trim().optional(),
  receiptImageUrl: z.string().trim().optional(),
});

export type ExpenseFormInput = z.input<typeof expenseFormSchema>;
export type ExpenseFormValues = z.output<typeof expenseFormSchema>;
