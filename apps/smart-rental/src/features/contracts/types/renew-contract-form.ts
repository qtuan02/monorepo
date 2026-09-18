import * as z from "zod";

import { positiveNumber } from "~/features/contracts/types/contract-form";

export const renewContractFormSchema = z.object({
  newEndDate: z.string().min(1, { error: "Vui lòng chọn ngày kết thúc mới" }),
  newRentAmount: positiveNumber("Vui lòng nhập tiền thuê mới"),
  notes: z
    .string()
    .trim()
    .transform((value) => value || undefined),
});

export type RenewContractFormInput = z.input<typeof renewContractFormSchema>;
export type RenewContractFormValues = z.output<typeof renewContractFormSchema>;
