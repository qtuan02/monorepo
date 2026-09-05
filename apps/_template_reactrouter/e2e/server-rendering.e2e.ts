import { expect, test } from "@playwright/test";

/**
 * The seam nothing else in this repo can cover: what `react-router-serve`
 * actually put on the wire. Every assertion here reads the raw document through
 * the `request` fixture — no browser, no hydration — so anything that passes
 * demonstrably came from the server rather than from JavaScript that ran after
 * paint.
 *
 * The `request` fixture inherits neither the project's `locale` nor a cookie
 * jar, which is what makes it the right tool for i18n too: every case states the
 * exact headers the server negotiates from.
 */
test.describe("server rendering", () => {
  test("sends the home page complete, before any JavaScript runs", async ({
    request,
  }) => {
    const response = await request.get("/", {
      headers: { "Accept-Language": "vi-VN,vi;q=0.9" },
    });

    expect(response.status()).toBe(200);

    const html = await response.text();

    // The document element carries a language, so a screen reader and a crawler
    // both know what they are reading before any script runs.
    expect(html).toMatch(/<html[^>]*\slang="vi"/);
    // `meta` ran on the server: the tab is named in the first response, not
    // patched in on hydration.
    expect(html).toMatch(/<title>[^<]*Template React Router[^<]*<\/title>/);
    expect(html).toContain('name="description"');
    // And the screen itself is in the payload, not an empty root div.
    expect(html).toContain("React Router framework mode");
  });
});
