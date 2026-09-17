import { describe, expect, it } from "vitest";

import {
  buildVietQrQuickLink,
  toVietQrAddInfo,
  VIETQR_ADD_INFO_MAX_LENGTH,
} from "~/utils/vietqr";

const bankAccount = {
  bankCode: "VCB",
  bankName: "Vietcombank",
  accountNumber: "0071000123456",
  accountName: "NGUYEN VAN CHU",
};

describe("toVietQrAddInfo", () => {
  it("strips Vietnamese diacritics", () => {
    expect(toVietQrAddInfo("Thanh toán phòng 101")).toBe(
      "Thanh toan phong 101",
    );
  });

  it(`cuts at ${VIETQR_ADD_INFO_MAX_LENGTH} characters`, () => {
    const long = "HOA091 Phong 101 Thanh Vien Sinh Vien Xanh";
    expect(toVietQrAddInfo(long)).toHaveLength(VIETQR_ADD_INFO_MAX_LENGTH);
  });
});

describe("buildVietQrQuickLink", () => {
  it("is null when the Toà nhà has no Tài khoản nhận tiền yet", () => {
    expect(buildVietQrQuickLink(undefined, 1_000_000, "HD001 P101")).toBeNull();
  });

  it("builds an img.vietqr.io link carrying the amount and addInfo", () => {
    const link = buildVietQrQuickLink(bankAccount, 1_500_000, "HD001 P101");

    expect(link).toContain(
      "img.vietqr.io/image/VCB-0071000123456-compact2.png",
    );
    expect(link).toContain("amount=1500000");
    expect(link).toContain("addInfo=HD001+P101");
  });
});
