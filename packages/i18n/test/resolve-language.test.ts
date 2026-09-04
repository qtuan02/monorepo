import { describe, expect, it } from "vitest";

import { defaultLanguage } from "../src/languages";
import { resolveLanguage } from "../src/resolve-language";

/**
 * `resolveLanguage` is the server-side twin of the two Flavors' own detection:
 * it is what decides the language of a render that has no browser to ask, only
 * the request. Everything it can get wrong is silent — a wrong language renders
 * a perfectly valid page — so the seam is pinned here rather than left to be
 * noticed in production.
 */

const COOKIE_NAME = "monorepo_lang";

function request(headers: Record<string, string>) {
  return new Request("https://example.com/", { headers });
}

describe("the cookie", () => {
  it("wins over the header, because it is the choice the visitor made", () => {
    const resolved = resolveLanguage(
      request({ cookie: `${COOKIE_NAME}=en`, "accept-language": "vi" }),
      COOKIE_NAME,
    );

    expect(resolved).toBe("en");
  });

  it("is picked out from among the other cookies on the header", () => {
    const resolved = resolveLanguage(
      request({ cookie: `session=abc; ${COOKIE_NAME}=en; theme=dark` }),
      COOKIE_NAME,
    );

    expect(resolved).toBe("en");
  });

  // The cookie is attacker controlled, so holding a value off the registry is
  // an ordinary case and not an error: the request still carries a header that
  // states a real preference, and dropping straight to the default would throw
  // it away.
  it.each(["EN", "en-US", "EN-GB"])(
    "is normalized like a header range, so %s is still English",
    (stored) => {
      // The two writers of this cookie store a bare lowercase code today, so
      // this is not a case a browser produces on its own — it is the guarantee
      // that a stored choice cannot be thrown away by its casing or its region
      // and quietly replaced by the browser's default.
      const resolved = resolveLanguage(
        request({
          cookie: `${COOKIE_NAME}=${stored}`,
          "accept-language": "vi",
        }),
        COOKIE_NAME,
      );

      expect(resolved).toBe("en");
    },
  );
  it("falls through to the header when it holds a code off the registry", () => {
    const resolved = resolveLanguage(
      request({ cookie: `${COOKIE_NAME}=de`, "accept-language": "en" }),
      COOKIE_NAME,
    );

    expect(resolved).toBe("en");
  });

  it("falls through when a malformed value cannot be decoded", () => {
    const resolved = resolveLanguage(
      request({ cookie: `${COOKIE_NAME}=%E0%A4%A`, "accept-language": "en" }),
      COOKIE_NAME,
    );

    expect(resolved).toBe("en");
  });

  it("ignores a cookie of another name that holds a valid code", () => {
    const resolved = resolveLanguage(
      request({ cookie: "other_lang=en", "accept-language": "vi" }),
      COOKIE_NAME,
    );

    expect(resolved).toBe("vi");
  });
});

describe("the Accept-Language header", () => {
  // The registry holds bare codes only, so a region-tagged tag has to be
  // stripped the way i18next's `load: "languageOnly"` strips a detected one —
  // otherwise every real browser, which sends a region, misses the registry
  // and lands on the default.
  it("strips the region and honours q, so `en-US,vi;q=0.8` is English", () => {
    const resolved = resolveLanguage(
      request({ "accept-language": "en-US,vi;q=0.8" }),
      COOKIE_NAME,
    );

    expect(resolved).toBe("en");
  });

  // The only case that actually exercises the sort: the preferred language is
  // listed last, so returning the first parsed range would answer `vi`.
  it("takes the highest q even when it is not listed first", () => {
    const resolved = resolveLanguage(
      request({ "accept-language": "vi;q=0.3, fr;q=0.5, en;q=0.9" }),
      COOKIE_NAME,
    );

    expect(resolved).toBe("en");
  });

  it("keeps the header's order between ranges of equal q", () => {
    const resolved = resolveLanguage(
      request({ "accept-language": "en;q=0.5, vi;q=0.5" }),
      COOKIE_NAME,
    );

    expect(resolved).toBe("en");
  });

  it("treats a range with no q as more preferred than an explicit one", () => {
    const resolved = resolveLanguage(
      request({ "accept-language": "vi;q=0.9, en" }),
      COOKIE_NAME,
    );

    expect(resolved).toBe("en");
  });

  // `q=0` is how a client says "not this one". Ranking it last instead of
  // dropping it would hand back the very language it refused.
  it("excludes a range the client refused with q=0", () => {
    const resolved = resolveLanguage(
      request({ "accept-language": "en;q=0, de" }),
      COOKIE_NAME,
    );

    expect(resolved).toBe(defaultLanguage);
  });

  it("skips a language off the registry to reach one on it", () => {
    const resolved = resolveLanguage(
      request({ "accept-language": "de-DE,de;q=0.9,en;q=0.4" }),
      COOKIE_NAME,
    );

    expect(resolved).toBe("en");
  });

  it("tolerates the spacing and casing a real client sends", () => {
    const resolved = resolveLanguage(
      request({ "accept-language": "EN-GB ; Q=0.8 , de" }),
      COOKIE_NAME,
    );

    expect(resolved).toBe("en");
  });
});

describe("the fallback", () => {
  it("defaults when the header names nothing on the registry", () => {
    const resolved = resolveLanguage(
      request({ "accept-language": "de" }),
      COOKIE_NAME,
    );

    expect(resolved).toBe(defaultLanguage);
  });

  it("defaults when there is neither a cookie nor a header", () => {
    expect(resolveLanguage(request({}), COOKIE_NAME)).toBe(defaultLanguage);
  });

  it("defaults on a header that parses to nothing at all", () => {
    expect(
      resolveLanguage(request({ "accept-language": "*" }), COOKIE_NAME),
    ).toBe(defaultLanguage);
  });
});
