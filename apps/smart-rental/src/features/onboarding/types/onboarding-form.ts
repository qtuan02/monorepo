import * as z from "zod";

// Every field stays a string, as the prototype had it: the wizard only walks
// the landlord through, it submits nothing yet. The number inputs are
// validated for presence and nothing more, again as the prototype did.
export const onboardingFormSchema = z.object({
  buildingName: z
    .string()
    .trim()
    .min(2, { error: "Tên khu trọ tối thiểu 2 ký tự" }),
  address: z.string().trim().min(5, { error: "Địa chỉ tối thiểu 5 ký tự" }),
  floors: z.string().trim().min(1, { error: "Vui lòng nhập số tầng" }),
  rooms: z.string().trim().min(1, { error: "Vui lòng nhập số phòng" }),
  roomNamingRule: z
    .string()
    .trim()
    .min(1, { error: "Vui lòng nhập quy tắc đặt tên" }),
  defaultRent: z.string().trim().min(1, { error: "Vui lòng nhập giá thuê" }),
  // Optional: empty passes, anything else has to be an email.
  managerEmail: z.union([
    z.literal(""),
    z.email({ error: "Email không hợp lệ" }),
  ]),
});

export type OnboardingFormValues = z.infer<typeof onboardingFormSchema>;
