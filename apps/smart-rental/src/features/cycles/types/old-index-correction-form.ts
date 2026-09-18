import * as z from "zod";

/** "Sửa chỉ số cũ" (ticket #183, ADR-0013) — thay công tơ mid-kỳ, ghi chú bắt buộc. */
export const oldIndexCorrectionFormSchema = z.object({
  oldIndex: z
    .string()
    .trim()
    .regex(/^\d+$/, { error: "Chỉ số phải là số nguyên không âm" }),
  note: z
    .string()
    .trim()
    .min(1, { error: "Vui lòng nhập lý do (VD: thay công tơ)" }),
});

export type OldIndexCorrectionFormValues = z.infer<
  typeof oldIndexCorrectionFormSchema
>;
