import * as z from "zod";

// A blank optional field is `undefined` on the way out, so the request never
// carries an empty vehicle.
const optionalText = z
  .string()
  .trim()
  .transform((value) => value || undefined);

export const tenantFormSchema = z.object({
  fullName: z
    .string({ error: "Họ và tên tối thiểu 2 ký tự" })
    .trim()
    .min(2, { error: "Họ và tên tối thiểu 2 ký tự" }),
  idCard: z
    .string({ error: "Số CCCD không hợp lệ" })
    .trim()
    .min(9, { error: "Số CCCD không hợp lệ" }),
  dob: z.string().min(1, { error: "Vui lòng nhập ngày sinh" }),
  hometown: z
    .string({ error: "Vui lòng nhập quê quán" })
    .trim()
    .min(2, { error: "Vui lòng nhập quê quán" }),
  phone: z
    .string({ error: "Số điện thoại không hợp lệ" })
    .trim()
    .min(9, { error: "Số điện thoại không hợp lệ" }),
  email: z.email({ error: "Email không hợp lệ" }),
  vehicleType: optionalText,
  vehiclePlate: optionalText,
});

export type TenantFormInput = z.input<typeof tenantFormSchema>;
export type TenantFormValues = z.output<typeof tenantFormSchema>;
