import { describe, expect, it } from "vitest";

import { normalizeRequestPath } from "~/features/auth/utils/request-path";

/**
 * What the guard writes into `redirectTo` has to be the path the visitor asked
 * for, and on a client-side navigation the server never sees that path: the
 * router fetches `/dashboard.data?_routes=…` instead. A guard that copied the
 * request URL would send the visitor back to a `.data` URL after sign-in and
 * hand them a turbo-stream payload as a page.
 */
describe("normalizeRequestPath", () => {
  it("returns a document request's path and query unchanged", () => {
    expect(normalizeRequestPath(new URL("http://localhost/dashboard"))).toBe(
      "/dashboard",
    );
    expect(
      normalizeRequestPath(new URL("http://localhost/dashboard?tab=billing")),
    ).toBe("/dashboard?tab=billing");
  });

  it("strips the .data suffix a client navigation fetches", () => {
    expect(
      normalizeRequestPath(new URL("http://localhost/dashboard.data")),
    ).toBe("/dashboard");
  });

  it("strips the _.data suffix a trailing-slash path fetches", () => {
    // `/` fetches `/_.data`, not `/.data`: the underscore keeps the pathname
    // from ending in a bare dot.
    expect(normalizeRequestPath(new URL("http://localhost/_.data"))).toBe("/");
    expect(
      normalizeRequestPath(new URL("http://localhost/dashboard/_.data")),
    ).toBe("/dashboard/");
  });

  it("drops the router's own search params and keeps the visitor's", () => {
    expect(
      normalizeRequestPath(
        new URL(
          "http://localhost/dashboard.data?tab=billing&_routes=routes%2Fdashboard&index",
        ),
      ),
    ).toBe("/dashboard?tab=billing");
  });

  it("keeps an index param that carries a value, which is app data", () => {
    // The router adds a BARE `?index` to target an index route's action; an
    // `?index=3` is ordinary app data that happens to share the name.
    expect(
      normalizeRequestPath(new URL("http://localhost/dashboard.data?index=3")),
    ).toBe("/dashboard?index=3");
  });

  it("never carries a hash, which a server never receives anyway", () => {
    expect(
      normalizeRequestPath(new URL("http://localhost/dashboard#totals")),
    ).toBe("/dashboard");
  });
});
