import * as z from "zod";

// A reading arrives from <input type="number"> as a string; empty is allowed
// (not every Phòng of the kỳ is read yet), anything else must be a whole
// non-negative number.
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

/** `null` while the field is empty or not a whole number. */
export function parseNewIndex(input: string): number | null {
  if (input.trim() === "") return null;
  const value = Number(input);
  return Number.isFinite(value) ? value : null;
}

/**
 * "Chỉ số mới < cũ" bị chặn hẳn (ticket #183, ADR-0013) — a per-row minimum
 * the static `cycleFormSchema` can't express, since it depends on each row's
 * own chỉ số cũ. Built fresh per mount (`CycleForm`'s `key={buildingId-month}`
 * already remounts on a new `rows` fetch), never memoized against a stale set.
 */
export function buildCycleFormSchema(
  rows: { oldElectricity: number; oldWater: number }[],
) {
  return cycleFormSchema.superRefine((values, ctx) => {
    values.rows.forEach((value, index) => {
      const row = rows[index];
      if (!row) return;

      const newElectricity = parseNewIndex(value.newElectricity);
      if (newElectricity !== null && newElectricity < row.oldElectricity) {
        ctx.addIssue({
          code: "custom",
          path: ["rows", index, "newElectricity"],
          message: `Chỉ số mới phải ≥ chỉ số cũ (${row.oldElectricity})`,
        });
      }

      const newWater = parseNewIndex(value.newWater);
      if (newWater !== null && newWater < row.oldWater) {
        ctx.addIssue({
          code: "custom",
          path: ["rows", index, "newWater"],
          message: `Chỉ số mới phải ≥ chỉ số cũ (${row.oldWater})`,
        });
      }
    });
  });
}
