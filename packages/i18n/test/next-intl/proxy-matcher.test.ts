import { describe, expect, it } from "vitest";

import { I18N_PROXY_MATCHER } from "../../src/next-intl/proxy-matcher";

/**
 * The matcher decides which requests pay for locale negotiation. Getting it
 * wrong is invisible in review and expensive at runtime — a missing exclusion
 * runs the proxy on every static asset, an over-broad one skips real pages.
 *
 * Next compiles the string with path-to-regexp; for a single unnamed group
 * holding a raw pattern that is the anchored regex reconstructed here.
 */
const matcher = new RegExp(`^${I18N_PROXY_MATCHER}$`);

describe("I18N_PROXY_MATCHER", () => {
  it.each(["/", "/gioi-thieu", "/en/gioi-thieu", "/en"])(
    "negotiates the locale for %s",
    (pathname) => {
      expect(matcher.test(pathname)).toBe(true);
    },
  );

  it.each([
    "/api/health",
    "/trpc/list",
    "/_next/static/chunks/main.js",
    "/_vercel/insights/script.js",
    "/favicon.ico",
    "/en/logo.svg",
  ])("stays out of the way for %s", (pathname) => {
    expect(matcher.test(pathname)).toBe(false);
  });
});
