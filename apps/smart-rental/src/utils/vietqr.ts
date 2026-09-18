import type { BankAccount } from "~/types/building";

/** "cắt 25 ký tự" (spec #153 §10 row 12). */
export const VIETQR_ADD_INFO_MAX_LENGTH = 25;

/** Strips Vietnamese diacritics — VietQR's `addInfo` must read plain ASCII. */
function stripDiacritics(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");
}

/** "bỏ dấu ≤ 25 ký tự" — the one place a Hoá đơn's transfer note is built. */
export function toVietQrAddInfo(value: string): string {
  return stripDiacritics(value).slice(0, VIETQR_ADD_INFO_MAX_LENGTH);
}

/**
 * The Quick Link `img.vietqr.io` reads — `null` when the Toà nhà has no
 * Tài khoản nhận tiền yet, never a fake QR (spec #153 §10 row 12).
 */
export function buildVietQrQuickLink(
  bankAccount: BankAccount | undefined,
  amount: number,
  addInfo: string,
): string | null {
  if (!bankAccount) return null;

  const params = new URLSearchParams({
    amount: String(Math.max(0, Math.round(amount))),
    addInfo: toVietQrAddInfo(addInfo),
    accountName: bankAccount.accountName,
  });
  return `https://img.vietqr.io/image/${bankAccount.bankCode}-${bankAccount.accountNumber}-compact2.png?${params.toString()}`;
}
