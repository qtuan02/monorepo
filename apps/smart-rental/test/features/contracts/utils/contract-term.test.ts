import { describe, expect, it } from "vitest";

import {
  computeContractEndDate,
  computeRenewedEndDate,
} from "~/features/contracts/utils/contract-term";

describe("computeContractEndDate", () => {
  it("ends one day short of the anniversary — 12 tháng từ 18/09 kết thúc 17/09 năm sau", () => {
    expect(computeContractEndDate("2026-09-18", 12)).toBe("2027-09-17");
  });

  it("6 tháng từ 18/09/2026 kết thúc 17/03/2027", () => {
    expect(computeContractEndDate("2026-09-18", 6)).toBe("2027-03-17");
  });
});

describe("computeRenewedEndDate", () => {
  it("extends the existing (display-formatted) end date with no day adjustment", () => {
    expect(computeRenewedEndDate("30/09/2026", 6)).toBe("2027-03-30");
    expect(computeRenewedEndDate("30/09/2026", 12)).toBe("2027-09-30");
  });
});
