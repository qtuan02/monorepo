import * as z from "zod";

// The number fields arrive from <input type="number"> as strings, so each is
// a string on the way in and a number on the way out — `BuildingFormInput`
// types the form, `BuildingFormValues` the parsed request.
const wholeNumber = (error: string) =>
  z
    .string()
    .trim()
    .min(1, { error })
    .pipe(z.coerce.number<string>({ error }).int({ error }));

export const buildingFormSchema = z.object({
  name: z
    .string({ error: "Tên tòa nhà phải có ít nhất 2 ký tự" })
    .trim()
    .min(2, { error: "Tên tòa nhà phải có ít nhất 2 ký tự" }),
  address: z
    .string({ error: "Địa chỉ phải có ít nhất 5 ký tự" })
    .trim()
    .min(5, { error: "Địa chỉ phải có ít nhất 5 ký tự" }),
  totalFloors: wholeNumber("Ít nhất 1 tầng").pipe(
    z.number().min(1, { error: "Ít nhất 1 tầng" }),
  ),
  utilityCycleDay: wholeNumber("Ngày từ 1 đến 31").pipe(
    z
      .number()
      .min(1, { error: "Ngày từ 1 đến 31" })
      .max(31, { error: "Ngày từ 1 đến 31" }),
  ),
  note: z
    .string()
    .trim()
    .transform((value) => value || undefined),
});

export type BuildingFormInput = z.input<typeof buildingFormSchema>;
export type BuildingFormValues = z.output<typeof buildingFormSchema>;
