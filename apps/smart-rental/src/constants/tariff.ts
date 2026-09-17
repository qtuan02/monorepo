/**
 * Trần giá điện sinh hoạt bậc cao nhất theo Thông tư 60/2025/TT-BCT của Bộ
 * Công Thương (spec #153 §10 row 28) — Bảng giá của một Toà nhà không được
 * vượt hằng số này; xem `~/utils/tariff.ts` cho phép so sánh.
 */
export const ELECTRICITY_PRICE_CAP_PER_KWH = 3_900;
