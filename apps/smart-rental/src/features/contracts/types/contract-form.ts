import * as z from "zod";

// Number inputs hand over strings: string in, number out (the building form's shape).
export const positiveNumber = (error: string) =>
  z
    .string()
    .trim()
    .min(1, { error })
    .pipe(z.coerce.number<string>({ error }).positive({ error }));

export const contractFormSchema = z.object({
  buildingId: z.string().min(1, { error: "Vui lòng chọn tòa nhà" }),
  roomId: z.string().min(1, { error: "Vui lòng chọn phòng" }),
  tenantName: z
    .string({ error: "Vui lòng nhập tên khách" })
    .trim()
    .min(2, { error: "Vui lòng nhập tên khách" }),
  tenantPhone: z
    .string({ error: "Số điện thoại không hợp lệ" })
    .trim()
    .min(9, { error: "Số điện thoại không hợp lệ" }),
  tenantIdCard: z
    .string({ error: "CCCD không hợp lệ" })
    .trim()
    .min(9, { error: "CCCD không hợp lệ" }),
  startDate: z.string().min(1, { error: "Vui lòng chọn ngày bắt đầu" }),
  termMonths: positiveNumber("Vui lòng nhập thời hạn").pipe(
    z.number().int({ error: "Thời hạn là số tháng nguyên" }),
  ),
  rentAmount: positiveNumber("Vui lòng nhập giá thuê"),
  depositAmount: positiveNumber("Vui lòng nhập tiền cọc"),
});

export type ContractFormInput = z.input<typeof contractFormSchema>;
export type ContractFormValues = z.output<typeof contractFormSchema>;
