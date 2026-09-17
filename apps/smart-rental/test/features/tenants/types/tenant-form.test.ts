import { describe, expect, it } from "vitest";

import { tenantFormSchema } from "~/features/tenants/types/tenant-form";

const valid = {
  fullName: "Nguyễn Văn An",
  idCard: "079123456789",
  dob: "1990-01-01",
  hometown: "Quận 1, TP. Hồ Chí Minh",
  phone: "0905123456",
  email: "an@example.com",
  vehicleType: "",
  vehiclePlate: "",
};

describe("tenantFormSchema", () => {
  it("accepts a full profile and drops the blank vehicle fields", () => {
    expect(tenantFormSchema.parse(valid)).toEqual({
      ...valid,
      vehicleType: undefined,
      vehiclePlate: undefined,
    });
  });

  it("trims before checking the name's length", () => {
    const result = tenantFormSchema.safeParse({ ...valid, fullName: " A " });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe(
      "Họ và tên tối thiểu 2 ký tự",
    );
  });

  it("wants a real email and a 9+ digit CCCD", () => {
    expect(
      tenantFormSchema.safeParse({ ...valid, email: "not-an-email" }).error
        ?.issues[0]?.message,
    ).toBe("Email không hợp lệ");
    expect(
      tenantFormSchema.safeParse({ ...valid, idCard: "12345" }).error?.issues[0]
        ?.message,
    ).toBe("Số CCCD không hợp lệ");
  });
});
