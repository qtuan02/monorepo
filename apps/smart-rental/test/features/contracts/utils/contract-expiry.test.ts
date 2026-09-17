import { describe, expect, it } from "vitest";

import { getContractExpiryMeta } from "~/features/contracts/utils/contract-expiry";

describe("getContractExpiryMeta", () => {
  const now = new Date("2026-04-20T00:00:00");

  it("counts the days left from a DD/MM/YYYY end date", () => {
    expect(getContractExpiryMeta("30/04/2026", now)).toEqual({
      daysUntilEnd: 10,
      isExpiringSoon: true,
    });
  });

  it("is not 'soon' past 30 days, nor once already ended", () => {
    expect(getContractExpiryMeta("21/05/2026", now).isExpiringSoon).toBe(false);
    expect(getContractExpiryMeta("19/04/2026", now)).toEqual({
      daysUntilEnd: -1,
      isExpiringSoon: false,
    });
  });
});
