import * as z from "zod";

// Whole-number money/day fields arrive from <input type="number"> as strings.
const wholeNumber = (error: string) =>
  z
    .string()
    .trim()
    .min(1, { error })
    .pipe(z.coerce.number<string>({ error }).int({ error }));

const optionalText = () => z.string().trim();

/**
 * Cài đặt Toà nhà (spec #153 §10 rows 25/32/34): ngày thu, Bảng giá, Tài
 * khoản nhận tiền — all four bank fields are optional TOGETHER, so a
 * landlord may leave the whole group blank (no VietQR yet, spec §10 row 26)
 * but never half-fill it.
 */
export const buildingSettingsFormSchema = z
  .object({
    collectionDay: wholeNumber("Ngày từ 1 đến 31").pipe(
      z
        .number()
        .min(1, { error: "Ngày từ 1 đến 31" })
        .max(31, { error: "Ngày từ 1 đến 31" }),
    ),
    electricityPricePerKwh: wholeNumber("Bắt buộc, tối thiểu 1đ").pipe(
      z.number().min(1, { error: "Bắt buộc, tối thiểu 1đ" }),
    ),
    waterPricePerM3: wholeNumber("Bắt buộc, tối thiểu 1đ").pipe(
      z.number().min(1, { error: "Bắt buộc, tối thiểu 1đ" }),
    ),
    serviceFee: wholeNumber("Bắt buộc, tối thiểu 0đ").pipe(
      z.number().min(0, { error: "Bắt buộc, tối thiểu 0đ" }),
    ),
    bankCode: optionalText(),
    bankName: optionalText(),
    accountNumber: optionalText(),
    accountName: optionalText(),
  })
  .refine(
    (values) => {
      const bankFields = [
        values.bankCode,
        values.bankName,
        values.accountNumber,
        values.accountName,
      ];
      const filledCount = bankFields.filter((value) => value !== "").length;
      return filledCount === 0 || filledCount === bankFields.length;
    },
    {
      error: "Điền đủ cả bốn trường Tài khoản nhận tiền, hoặc để trống cả bốn",
      path: ["accountName"],
    },
  );

export type BuildingSettingsFormInput = z.input<
  typeof buildingSettingsFormSchema
>;
export type BuildingSettingsFormValues = z.output<
  typeof buildingSettingsFormSchema
>;
