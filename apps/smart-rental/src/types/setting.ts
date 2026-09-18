/**
 * Cài đặt toàn cục (spec #153 §10 row 32) is just the landlord's own contact
 * card now — per-Toà nhà settings (ngày thu, Bảng giá, Tài khoản nhận tiền)
 * moved to `/buildings/:id`'s own "Cài đặt" tab, and the old bậc thang
 * electricity form is gone (row 7: flat pricing per Toà nhà instead).
 */
export interface LandlordProfile {
  name: string;
  phone: string;
  email: string;
}
