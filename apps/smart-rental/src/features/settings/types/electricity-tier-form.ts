import * as z from "zod";

import type { ElectricityTierConfig } from "~/types/setting";

// Every field arrives from an <input type="number"> as a string, so each is
// a string on the way in and a number on the way out — `…FormInput` types the
// form, `…FormValues` the saved config (the `building-form` shape).
const kwh = (error: string) =>
  z
    .string()
    .trim()
    .min(1, { error })
    .pipe(z.coerce.number<string>({ error }).int({ error }).min(0, { error }));

const tierSchema = z
  .object({
    from: kwh("Từ (kWh) phải là số nguyên không âm"),
    // Blank is the open-ended last step.
    to: z
      .string()
      .trim()
      .transform((value) => (value === "" ? null : value))
      .pipe(
        z.coerce
          .number<string>({ error: "Đến (kWh) phải là số nguyên không âm" })
          .int({ error: "Đến (kWh) phải là số nguyên không âm" })
          .min(0, { error: "Đến (kWh) phải là số nguyên không âm" })
          .nullable(),
      ),
    price: z
      .string()
      .trim()
      .min(1, { error: "Đơn giá là bắt buộc" })
      .pipe(
        z.coerce
          .number<string>({ error: "Đơn giá phải là số không âm" })
          .min(0, { error: "Đơn giá phải là số không âm" }),
      ),
  })
  // A step that ends before it starts is nonsense in any tariff; continuity
  // BETWEEN steps is a business rule the prototype never had, left to the
  // spec owner.
  .refine((tier) => tier.to === null || tier.from <= tier.to, {
    error: "Đến (kWh) phải lớn hơn hoặc bằng Từ (kWh)",
    path: ["to"],
  });

export const electricityTierFormSchema = z.object({
  useVat: z.boolean(),
  tiers: z.array(tierSchema).min(1, { error: "Cần ít nhất một bậc" }),
});

export type ElectricityTierFormInput = z.input<
  typeof electricityTierFormSchema
>;
export type ElectricityTierFormValues = z.output<
  typeof electricityTierFormSchema
>;

/** The saved config as the form's strings — what `useForm` resets to. */
export function toElectricityTierFormInput(
  config: ElectricityTierConfig,
): ElectricityTierFormInput {
  return {
    useVat: config.useVat,
    tiers: config.tiers.map((tier) => ({
      from: String(tier.from),
      to: tier.to === null ? "" : String(tier.to),
      price: String(tier.price),
    })),
  };
}

/** Where "Thêm bậc thang" starts: one kWh after the last step's «Đến», or after its «Từ» when open. */
export function nextTierFrom(tiers: ElectricityTierFormInput["tiers"]): string {
  const last = tiers.at(-1);
  if (!last) return "0";
  const end = Number.parseInt(last.to || last.from, 10);
  return String((Number.isNaN(end) ? 0 : end) + 1);
}
