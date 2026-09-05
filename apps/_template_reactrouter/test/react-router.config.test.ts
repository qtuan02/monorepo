// @vitest-environment node
//
// The config reads `process.env` directly (it runs before the app exists), so
// this is stubbed and re-imported per case rather than parsed once.

import { afterEach, describe, expect, it, vi } from "vitest";

async function importConfig() {
  vi.resetModules();
  return (await import("../react-router.config")).default;
}

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("react-router.config", () => {
  it("prerenders exactly the about page, and nothing that negotiates per request", async () => {
    // `prerender: true` would also emit an `index.html` for `/`, and the
    // static middleware answers before the request handler — the home page
    // would silently stop being server rendered.
    expect((await importConfig()).prerender).toEqual(["/about"]);
  });

  it("allows form actions from the host the app is built against", async () => {
    // Behind a TLS-terminating proxy the browser's `Origin` is https while
    // `request.url` is http, and the framework's CSRF check answers 400 unless
    // the host is listed here. Host only — the scheme is the very thing that
    // differs.
    vi.stubEnv("PUBLIC_BASE_DOMAIN", "https://app.example.com");

    expect((await importConfig()).allowedActionOrigins).toEqual([
      "app.example.com",
    ]);
  });

  it("still loads with no env at all, which is how typegen runs it", async () => {
    vi.stubEnv("PUBLIC_BASE_DOMAIN", "");

    expect((await importConfig()).allowedActionOrigins).toEqual([]);
  });
});
