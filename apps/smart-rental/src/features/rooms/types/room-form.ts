import * as z from "zod";

import { wholeNumberSchema as wholeNumber } from "~/utils/zod-whole-number";

/**
 * "Tạo/sửa Phòng" (spec #153 §10 row 15): a short `FormSheet` — Toà nhà
 * (Combobox), tên, tầng, diện tích, loại, trạng thái, giá thuê. Occupancy
 * (`tenant`) is not a form field — it flows through Hợp đồng, not through
 * editing a Phòng directly (ADR-0012 derives nothing about Room, but nothing
 * here writes `tenant` either).
 */
export const roomFormSchema = z.object({
  buildingId: z
    .string({ error: "Chọn một toà nhà" })
    .trim()
    .min(1, { error: "Chọn một toà nhà" }),
  name: z
    .string({ error: "Tên phòng phải có ít nhất 1 ký tự" })
    .trim()
    .min(1, { error: "Tên phòng phải có ít nhất 1 ký tự" }),
  floor: wholeNumber("Ít nhất tầng 1").pipe(
    z.number().min(1, { error: "Ít nhất tầng 1" }),
  ),
  area: wholeNumber("Diện tích tối thiểu 1m²").pipe(
    z.number().min(1, { error: "Diện tích tối thiểu 1m²" }),
  ),
  type: z.enum(["single", "double", "studio", "suite"], {
    error: "Chọn loại phòng",
  }),
  status: z.enum(["available", "occupied", "maintenance", "reserved"], {
    error: "Chọn trạng thái",
  }),
  price: wholeNumber("Bắt buộc, tối thiểu 1đ").pipe(
    z.number().min(1, { error: "Bắt buộc, tối thiểu 1đ" }),
  ),
});

export type RoomFormInput = z.input<typeof roomFormSchema>;
export type RoomFormValues = z.output<typeof roomFormSchema>;
