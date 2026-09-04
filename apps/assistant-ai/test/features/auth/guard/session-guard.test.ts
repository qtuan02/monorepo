import { describe, expect, it } from "vitest";

import {
  decideSessionRedirect,
  isProtectedPathname,
  splitLocalePrefix,
  withLocalePrefix,
} from "~/features/auth/guard/session-guard";

describe("splitLocalePrefix", () => {
  it("separates a known locale segment from the rest of the path", () => {
    expect(splitLocalePrefix("/en/dashboard")).toEqual({
      locale: "en",
      rest: "/dashboard",
    });
  });

  it("reads a bare locale as that locale's home", () => {
    expect(splitLocalePrefix("/en")).toEqual({ locale: "en", rest: "/" });
  });

  it("leaves an unprefixed path alone — that is the default locale", () => {
    expect(splitLocalePrefix("/dashboard")).toEqual({
      locale: undefined,
      rest: "/dashboard",
    });
  });

  it("does not mistake a path segment for a locale", () => {
    // "de" is not in the registry, so this is a page called /de, not German.
    expect(splitLocalePrefix("/de/dashboard")).toEqual({
      locale: undefined,
      rest: "/de/dashboard",
    });
  });
});

describe("withLocalePrefix", () => {
  it("round-trips a prefixed path", () => {
    expect(withLocalePrefix("en", "/sign-in")).toBe("/en/sign-in");
  });

  it("keeps home from becoming a double slash", () => {
    expect(withLocalePrefix("en", "/")).toBe("/en");
  });

  it("adds nothing when the request carried no prefix", () => {
    expect(withLocalePrefix(undefined, "/sign-in")).toBe("/sign-in");
  });
});

describe("isProtectedPathname", () => {
  it("matches the group root and everything under it", () => {
    expect(isProtectedPathname("/dashboard")).toBe(true);
    expect(isProtectedPathname("/dashboard/reports")).toBe(true);
  });

  it("does not match a path that merely starts with the same letters", () => {
    expect(isProtectedPathname("/dashboards-public")).toBe(false);
  });

  it("leaves public paths alone", () => {
    expect(isProtectedPathname("/")).toBe(false);
    expect(isProtectedPathname("/sign-in")).toBe(false);
  });
});

describe("decideSessionRedirect", () => {
  it("sends a signed-out visitor to sign-in, remembering where they were going", () => {
    expect(
      decideSessionRedirect({ pathname: "/dashboard", hasSession: false }),
    ).toEqual({ pathname: "/sign-in", redirectTo: "/dashboard" });
  });

  it("remembers the query string too, so filters survive the sign-in round trip", () => {
    expect(
      decideSessionRedirect({
        pathname: "/dashboard",
        search: "?tab=billing&page=3",
        hasSession: false,
      }),
    ).toEqual({
      pathname: "/sign-in",
      redirectTo: "/dashboard?tab=billing&page=3",
    });
  });

  it("adds no stray ? when the request carried no query", () => {
    expect(
      decideSessionRedirect({
        pathname: "/dashboard",
        search: "",
        hasSession: false,
      }),
    ).toEqual({ pathname: "/sign-in", redirectTo: "/dashboard" });
  });

  it("keeps the locale prefix the request arrived on", () => {
    expect(
      decideSessionRedirect({ pathname: "/en/dashboard", hasSession: false }),
    ).toEqual({ pathname: "/en/sign-in", redirectTo: "/en/dashboard" });
  });

  it("lets a signed-in visitor through to the guarded page", () => {
    expect(
      decideSessionRedirect({ pathname: "/dashboard", hasSession: true }),
    ).toBeNull();
  });

  it("sends a signed-in visitor away from sign-in", () => {
    expect(
      decideSessionRedirect({ pathname: "/en/sign-in", hasSession: true }),
    ).toEqual({ pathname: "/en" });
  });

  it("leaves sign-in reachable for a signed-out visitor", () => {
    expect(
      decideSessionRedirect({ pathname: "/sign-in", hasSession: false }),
    ).toBeNull();
  });

  it("never gates a public page", () => {
    expect(
      decideSessionRedirect({ pathname: "/", hasSession: false }),
    ).toBeNull();
  });
});
