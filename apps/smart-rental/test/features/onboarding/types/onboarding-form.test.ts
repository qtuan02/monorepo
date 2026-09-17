import { describe, expect, it } from "vitest";

import { onboardingFormSchema } from "~/features/onboarding/types/onboarding-form";

const valid = {
  buildingName: "Trọ Sinh Viên",
  address: "123 Ngũ Hành Sơn, Đà Nẵng",
  floors: "3",
  rooms: "12",
  roomNamingRule: "Phòng {tầng}0{số}",
  defaultRent: "3000000",
  managerEmail: "",
};

describe("onboardingFormSchema", () => {
  it("accepts the filled wizard with no manager", () => {
    expect(onboardingFormSchema.safeParse(valid).success).toBe(true);
  });

  it("trims before the length check, so whitespace is not a name", () => {
    const result = onboardingFormSchema.safeParse({
      ...valid,
      buildingName: "   ",
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe(
      "Tên khu trọ tối thiểu 2 ký tự",
    );
  });

  it("lets the manager email be empty but not malformed", () => {
    expect(
      onboardingFormSchema.safeParse({ ...valid, managerEmail: "khong-phai" })
        .success,
    ).toBe(false);
    expect(
      onboardingFormSchema.safeParse({
        ...valid,
        managerEmail: "manager@example.com",
      }).success,
    ).toBe(true);
  });
});
