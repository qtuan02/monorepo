import { describe, expect, it } from "vitest";

import {
  formatDate,
  formatDateTime,
  formatMonth,
  formatOptionalDate,
} from "~/utils/date";

describe("formatDate", () => {
  it("renders day-first from an ISO string, a Date, or a timestamp", () => {
    expect(formatDate("2026-04-20")).toBe("20/04/2026");
    expect(formatDate(new Date(2026, 3, 20))).toBe("20/04/2026");
    expect(formatDate(new Date(2026, 3, 20).getTime())).toBe("20/04/2026");
  });
});

describe("formatDateTime", () => {
  it("renders the wall clock after the date (TZ is pinned to UTC)", () => {
    expect(formatDateTime("2024-04-25T10:30:00Z")).toBe("25/04/2024 10:30");
  });
});

describe("formatMonth", () => {
  it("reads a YYYY-MM period as MM/YYYY", () => {
    expect(formatMonth("2024-04")).toBe("04/2024");
  });
});

describe("formatOptionalDate", () => {
  it("formats an ISO date, and passes the '—' placeholder through untouched", () => {
    expect(formatOptionalDate("2026-04-20")).toBe("20/04/2026");
    expect(formatOptionalDate("—")).toBe("—");
  });
});
