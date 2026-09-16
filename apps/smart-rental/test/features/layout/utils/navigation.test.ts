import { describe, expect, it } from "vitest";

import { ROUTES } from "~/constants/routes";
import {
  isNavigationItemActive,
  resolveNavigationItem,
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
    expect(resolveNavigationItem("/khong-ton-tai")).toBe(dashboard);
    expect(resolveNavigationItem(ROUTES.contractRenewPath("c-1")).title).toBe(
      "Hợp đồng",
    );
  });
});
