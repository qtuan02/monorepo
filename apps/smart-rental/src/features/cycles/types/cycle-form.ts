import * as z from "zod";

// A reading arrives from <input type="number"> as a string; empty is allowed
// (not every Phòng of the kỳ is read yet), anything else must be a whole
// non-negative number — "chặn giảm" (rejecting a decrease outright) is a
// later ticket (ADR-0013), this round only flags it via the row's own
// ANOMALY status.
const reading = z
  .string()
  .trim()
  .regex(/^\d*$/, { error: "Chỉ số phải là số nguyên" });

export const cycleRowSchema = z.object({
  roomId: z.string(),
  newElectricity: reading,
  newWater: reading,
});

export const cycleFormSchema = z.object({
  rows: z.array(cycleRowSchema),
});

export type CycleFormValues = z.infer<typeof cycleFormSchema>;
