import * as z from "zod";

// A reading arrives from <input type="number"> as a string; empty is allowed
// (not every Phòng is read at once), anything else must be a whole number.
const reading = z
  .string()
  .trim()
  .regex(/^\d*$/, { error: "Chỉ số phải là số nguyên" });

// Only what the landlord types; the Phòng and its last readings stay on the
// Mock row the form row is rendered from. `approved` is the "Duyệt bất
// thường" gate (spec #153 §10 row 27) — never sent to the server as a field
// of its own, just what unblocks the save button for this row.
export const meterRowSchema = z.object({
  id: z.string(),
  newElectricity: reading,
  newWater: reading,
  approved: z.boolean(),
});

export const meterInputFormSchema = z.object({
  rows: z.array(meterRowSchema),
});

export type MeterInputFormValues = z.infer<typeof meterInputFormSchema>;
