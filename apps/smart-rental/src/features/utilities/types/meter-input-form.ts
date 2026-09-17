import * as z from "zod";

// A reading arrives from <input type="number"> as a string; empty is allowed
// (not every Phòng is read at once), anything else must be a whole number.
const reading = z
  .string()
  .trim()
  .regex(/^\d*$/, { error: "Chỉ số phải là số nguyên" });

// Only what the landlord types; the Phòng and its last readings stay on the
// Mock row the form row is rendered from.
export const meterRowSchema = z.object({
  id: z.string(),
  newElectricity: reading,
  newWater: reading,
});

export const meterInputFormSchema = z.object({
  rows: z.array(meterRowSchema),
});

export type MeterInputFormValues = z.infer<typeof meterInputFormSchema>;
