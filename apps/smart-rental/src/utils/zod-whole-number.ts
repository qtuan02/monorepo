import * as z from "zod";

/**
 * A whole-number field arriving from `<input type="number">` as a string —
 * `.pipe()` narrows the input type on the way out. Shared by every form
 * schema with a money/day/count field (buildings, rooms — the same shape is
 * duplicated in contracts/expenses/invoices/supplier-bills too, not
 * consolidated here since those slices are owned elsewhere).
 */
export const wholeNumberSchema = (error: string) =>
  z
    .string()
    .trim()
    .min(1, { error })
    .pipe(z.coerce.number<string>({ error }).int({ error }));
