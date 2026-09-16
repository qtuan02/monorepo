import { describe, expect, it } from "vitest";

import { formatCurrency } from "~/utils/currency";

describe("formatCurrency", () => {
  it("formats VND the way the prototype did — vi-VN, no decimals", () => {
    // ` ` is the non-breaking space Intl puts before the symbol.
    expect(formatCurrency(2500000)).toBe("2.500.000 ₫");
    expect(formatCurrency(0)).toBe("0 ₫");
  });
});
