import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ROUTES } from "~/constants/routes";
import {
  isNavigationItemActive,
  resolveNavigationItem,
  resolveNavigationItemTo,
} from "~/features/layout/utils/navigation";

describe("navigation", () => {
  it("marks an area for its own path and its sub-paths, on a segment boundary", () => {
    const rooms = resolveNavigationItem(ROUTES.ROOMS);

    expect(isNavigationItemActive(rooms, ROUTES.ROOMS)).toBe(true);
    expect(isNavigationItemActive(rooms, ROUTES.roomDetailPath("r-1"))).toBe(
      true,
    );
    // `/rooms-x` shares a prefix, not a segment.
    expect(isNavigationItemActive(rooms, "/rooms-x")).toBe(false);
  });

  it("matches the dashboard on `/` alone, and falls back to it", () => {
    const dashboard = resolveNavigationItem(ROUTES.HOME);

    expect(isNavigationItemActive(dashboard, ROUTES.BUILDINGS)).toBe(false);
    expect(isNavigationItemActive(dashboard, ROUTES.ROOMS)).toBe(false);
    expect(resolveNavigationItem("/khong-ton-tai")).toBe(dashboard);
    expect(resolveNavigationItem(ROUTES.contractRenewPath("c-1")).title).toBe(
      "Hợp đồng",
    );
  });

  describe("Kỳ điện nước & hoá đơn", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("resolves to Kỳ for any month, not just the one open at import", () => {
      const cycles = resolveNavigationItem(ROUTES.cycleDetailPath("2026-08"));

      expect(cycles.title).toBe("Kỳ điện nước & hoá đơn");
      expect(
        isNavigationItemActive(cycles, ROUTES.cycleDetailPath("2020-01")),
      ).toBe(true);
      expect(
        isNavigationItemActive(cycles, ROUTES.cycleDetailPath("2030-12")),
      ).toBe(true);
      expect(isNavigationItemActive(cycles, ROUTES.ROOMS)).toBe(false);
    });

    it("resolves `to` to the CURRENT month at call time, never the import-time one", () => {
      const cycles = resolveNavigationItem(ROUTES.cycleDetailPath("2020-01"));

      vi.setSystemTime(new Date("2026-08-15T00:00:00.000Z"));
      expect(resolveNavigationItemTo(cycles)).toBe(
        ROUTES.cycleDetailPath("2026-08"),
      );

      // A tab left open past midnight on the 1st still resolves the new month.
      vi.setSystemTime(new Date("2026-09-01T00:00:01.000Z"));
      expect(resolveNavigationItemTo(cycles)).toBe(
        ROUTES.cycleDetailPath("2026-09"),
      );
    });
  });
});
