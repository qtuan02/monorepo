import * as z from "zod";

// Number inputs hand over strings: string in, number out (the building form's shape).
export const positiveNumber = (error: string) =>
  z
    .string()
    .trim()
    .min(1, { error })
    .pipe(z.coerce.number<string>({ error }).positive({ error }));

/** Wizard step 1–3 fields (spec #153 §3.5): Phòng, Người thuê, rồi điều khoản. */
export const contractFormSchema = z
  .object({
    roomId: z.string().min(1, { error: "Vui lòng chọn phòng" }),
    tenantId: z.string().min(1, { error: "Vui lòng chọn người thuê" }),
    startDate: z.string().min(1, { error: "Vui lòng chọn ngày bắt đầu" }),
    endDate: z.string().min(1, { error: "Vui lòng chọn ngày kết thúc" }),
    rentAmount: positiveNumber("Vui lòng nhập giá thuê"),
    depositAmount: positiveNumber("Vui lòng nhập tiền cọc"),
    // "Báo trước" — mặc định 30 ngày, không enforce phạt (spec #153).
    noticeDays: positiveNumber("Vui lòng nhập số ngày báo trước").pipe(
      z.number().int({ error: "Số ngày báo trước là số nguyên" }),
    ),
  })
  .refine(
    (values) =>
      !values.startDate || !values.endDate || values.endDate > values.startDate,
    {
      error: "Ngày kết thúc phải sau ngày bắt đầu",
      path: ["endDate"],
    },
  );

export type ContractFormInput = z.input<typeof contractFormSchema>;
export type ContractFormValues = z.output<typeof contractFormSchema>;
