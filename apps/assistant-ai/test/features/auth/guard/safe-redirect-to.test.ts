import { describe, expect, it } from "vitest";

import { safeRedirectTo } from "~/features/auth/guard/safe-redirect-to";

/**
 * `redirectTo` is attacker-controlled end to end — the proxy writes it into the
 * sign-in URL, the hidden field copies it verbatim out of `searchParams`, and
 * the Server Action hands whatever comes back to `redirect()`. Next does not
 * normalise that string: it goes into the `Location` header as written. So this
 * function is the only check, and every value below is a URL a browser resolves
 * to a different origin.
 */
describe("safeRedirectTo", () => {
  it("keeps a path on this origin", () => {
    expect(safeRedirectTo("/dashboard")).toBe("/dashboard");
  });

  it("keeps the query string and hash, which is the whole point of remembering the URL", () => {
    expect(safeRedirectTo("/dashboard?tab=billing&page=3")).toBe(
      "/dashboard?tab=billing&page=3",
    );
    expect(safeRedirectTo("/dashboard?tab=billing#totals")).toBe(
      "/dashboard?tab=billing#totals",
    );
  });

  it("rejects an absolute URL", () => {
    expect(safeRedirectTo("https://evil.example/")).toBeUndefined();
  });

  it("rejects a protocol-relative URL", () => {
    expect(safeRedirectTo("//evil.example")).toBeUndefined();
  });

  it("rejects a backslash-authority URL, which a prefix check waves through", () => {
    // `/\evil.example` starts with a single "/" and its second character is not
    // "/", so `!v.startsWith("/") || v.startsWith("//")` accepts it — while the
    // URL spec says a backslash in a special-scheme URL is a "/", so the browser
    // reads the Location header as https://evil.example/.
    expect(safeRedirectTo("/\\evil.example")).toBeUndefined();
    expect(safeRedirectTo("/\\/evil.example")).toBeUndefined();
    expect(safeRedirectTo("\\\\evil.example")).toBeUndefined();
  });

  it("rejects a relative path, which is not a destination this app can honour", () => {
    expect(safeRedirectTo("dashboard")).toBeUndefined();
  });

  it("rejects anything that is not a string, including a File upload", () => {
    expect(safeRedirectTo(null)).toBeUndefined();
    expect(safeRedirectTo(new File([], "redirect.txt"))).toBeUndefined();
  });
});
