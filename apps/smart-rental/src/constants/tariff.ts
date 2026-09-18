/**
 * Trần giá điện sinh hoạt bậc cao nhất hiện hành — bậc 6 (401 kWh trở lên):
 * 3.460 đ/kWh, chưa VAT. Quyết định 1279/QĐ-BCT của Bộ Công Thương (ngày
 * 09/5/2025, hiệu lực 10/5/2025); vẫn còn hiệu lực qua Thông tư 60/2025/TT-BCT
 * (02/12/2025) theo điều khoản chuyển tiếp, vì biểu giá 5 bậc mới của Quyết
 * định 14/2025/QĐ-TTg chưa có giá cụ thể do Bộ Công Thương công bố (xác minh
 * 2026-09-18, research round 3 §D.11 — trước đó 3.900 không rõ nguồn). Bảng
 * giá của một Toà nhà không được vượt hằng số này (spec #153 §10 row 28); xem
 * `~/utils/tariff.ts` cho phép so sánh.
 */
export const ELECTRICITY_PRICE_CAP_PER_KWH = 3_460;
