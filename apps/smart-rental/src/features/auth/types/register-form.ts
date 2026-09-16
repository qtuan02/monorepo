import * as z from "zod";

/**
 * The prototype's register schema minus `role`: nothing enforced it, and the
 * only account a landlord's Portal knows is the landlord (spec #127).
 */
export const registerFormSchema = z.object({
  name: z
    .string({ error: "Tên phải có ít nhất 2 ký tự" })
    .trim()
    .min(2, { error: "Tên phải có ít nhất 2 ký tự" }),
  email: z.email({ error: "Email không hợp lệ" }),
  password: z
    .string({ error: "Mật khẩu phải có ít nhất 6 ký tự" })
    .min(6, { error: "Mật khẩu phải có ít nhất 6 ký tự" }),
});

export type RegisterFormValues = z.infer<typeof registerFormSchema>;
