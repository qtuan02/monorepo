import * as z from "zod";

// A reading arrives from <input type="number"> as a string; empty is allowed
// (not every Phòng is read at once), anything else must be a whole number.
const reading = z
  .string()
  .trim()
  .regex(/^\d*$/, { error: "Chỉ số phải là số nguyên" });

export const meterRowSchema = z.object({
  id: z.string(),
  name: z.string(),
  lastElectricity: z.number(),
  lastWater: z.number(),
  newElectricity: reading,
  newWater: reading,
});

export const meterInputFormSchema = z.object({
  rows: z.array(meterRowSchema),
});

export type MeterInputFormValues = z.infer<typeof meterInputFormSchema>;
