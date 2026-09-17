import * as z from "zod";

/**
 * Quyết toán Cọc (spec #153): giữ toàn bộ (không hoàn) / hoàn toàn bộ / hoàn
 * một phần — the three a landlord picks from once Cọc is no longer `HELD`.
 */
export const liquidationDecisionOptions = [
  { value: "FORFEITED", label: "Giữ toàn bộ (không hoàn)" },
  { value: "RETURNED", label: "Hoàn toàn bộ" },
  { value: "PARTIAL_RETURNED", label: "Hoàn một phần" },
] as const;

export const liquidationFormSchema = z
  .object({
    decision: z.enum(["FORFEITED", "RETURNED", "PARTIAL_RETURNED"], {
      error: "Vui lòng chọn cách quyết toán Cọc",
    }),
    // Only read (and required) when `decision` is `PARTIAL_RETURNED` — the
    // default the template seeds it with is "availableAfterDebt", editable down.
    returnAmount: z
      .string()
      .trim()
      .pipe(z.coerce.number<string>().nonnegative())
      .optional(),
    reason: z
      .string()
      .trim()
      .transform((value) => value || undefined),
  })
  .refine(
    (values) => values.decision !== "PARTIAL_RETURNED" || !!values.reason,
    { error: "Vui lòng nhập lý do hoàn một phần", path: ["reason"] },
  )
  .refine(
    (values) =>
      values.decision !== "PARTIAL_RETURNED" ||
      values.returnAmount !== undefined,
    { error: "Vui lòng nhập số tiền hoàn lại", path: ["returnAmount"] },
  );

export type LiquidationFormInput = z.input<typeof liquidationFormSchema>;
export type LiquidationFormValues = z.output<typeof liquidationFormSchema>;
