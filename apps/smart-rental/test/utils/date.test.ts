import { describe, expect, it } from "vitest";

import { formatDate } from "~/utils/date";

describe("formatDate", () => {
  it("renders day-first from an ISO string, a Date, or a timestamp", () => {
    expect(formatDate("2026-04-20")).toBe("20/04/2026");
    expect(formatDate(new Date(2026, 3, 20))).toBe("20/04/2026");
    expect(formatDate(new Date(2026, 3, 20).getTime())).toBe("20/04/2026");
  });
});
