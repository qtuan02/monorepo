import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { setDayjsLocale } from "@monorepo/dayjs/set-locale";

import {
  formatConversationTimestamp,
  formatMessageDateLabel,
  formatMessageTime,
  isSameDay,
} from "~/utils/date";

// A Wednesday — `TZ=UTC` is pinned in vitest.config.ts, so "now" and every
// timestamp below read on the same clock with no local/UTC drift.
const NOW = "2026-09-16T12:00:00.000Z";

describe("~/utils/date", () => {
  beforeEach(() => {
    // vitest.setup.ts pins i18next to "en"; these functions take the
    // language explicitly rather than reading dayjs's global locale (see
    // .agents/rules/dates-locale-render-input.md), so every call below
    // passes "en" too.
    setDayjsLocale("en");
    vi.useFakeTimers();
    vi.setSystemTime(new Date(NOW));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("formatConversationTimestamp", () => {
    it("renders a bare time for a message sent earlier today", () => {
      expect(
        formatConversationTimestamp("2026-09-16T08:30:00.000Z", "en"),
      ).toBe("08:30");
    });

    it("renders 'Yesterday' for a message sent the day before", () => {
      expect(
        formatConversationTimestamp("2026-09-15T23:00:00.000Z", "en"),
      ).toBe("Yesterday");
    });

    it("renders the weekday for a message within the last week", () => {
      expect(
        formatConversationTimestamp("2026-09-14T10:00:00.000Z", "en"),
      ).toBe("Monday");
    });

    it("renders a bare date for a message older than a week", () => {
      expect(
        formatConversationTimestamp("2026-08-01T10:00:00.000Z", "en"),
      ).toBe("01/08/2026");
    });
  });

  describe("formatMessageDateLabel", () => {
    it("labels today's date divider 'Today'", () => {
      expect(formatMessageDateLabel("2026-09-16T00:05:00.000Z", "en")).toBe(
        "Today",
      );
    });

    it("labels yesterday's date divider 'Yesterday'", () => {
      expect(formatMessageDateLabel("2026-09-15T23:59:00.000Z", "en")).toBe(
        "Yesterday",
      );
    });

    it("labels a day earlier this week with its weekday", () => {
      expect(formatMessageDateLabel("2026-09-14T09:00:00.000Z", "en")).toBe(
        "Monday",
      );
    });

    it("labels an older date this year as day/month", () => {
      expect(formatMessageDateLabel("2026-01-05T00:00:00.000Z", "en")).toBe(
        "05/01",
      );
    });

    it("labels a date from a previous year with the full date", () => {
      expect(formatMessageDateLabel("2025-01-05T00:00:00.000Z", "en")).toBe(
        "05/01/2025",
      );
    });
  });

  it("formatMessageTime renders a bare hh:mm", () => {
    expect(formatMessageTime("2026-09-16T08:05:00.000Z")).toBe("08:05");
  });

  describe("isSameDay", () => {
    it("is true for two instants on the same calendar day", () => {
      expect(
        isSameDay("2026-09-16T00:00:00.000Z", "2026-09-16T23:59:00.000Z"),
      ).toBe(true);
    });

    it("is false across a day boundary", () => {
      expect(
        isSameDay("2026-09-16T23:59:00.000Z", "2026-09-17T00:00:00.000Z"),
      ).toBe(false);
    });
  });
});
