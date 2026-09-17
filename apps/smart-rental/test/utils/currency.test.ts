import { describe, expect, it } from "vitest";

import { formatCurrency, formatMillions } from "~/utils/currency";

describe("formatCurrency", () => {
  it("formats VND the way the prototype did — vi-VN, no decimals", () => {
    // ` ` is the non-breaking space Intl puts before the symbol.
    expect(formatCurrency(2500000)).toBe("2.500.000 ₫");
    expect(formatCurrency(0)).toBe("0 ₫");
  });
});

describe("formatMillions", () => {
  it("writes VND in triệu with one decimal, as the dashboard's summary reads", () => {
    expect(formatMillions(545_200_000)).toBe("545.2tr");
    expect(formatMillions(0)).toBe("0.0tr");
  });
});
