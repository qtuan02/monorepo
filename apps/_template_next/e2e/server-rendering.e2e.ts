import { expect, test } from "@playwright/test";

/**
 * The `request` fixture fetches the document with **no browser and no
 * hydration**, so anything asserted here demonstrably came from the server.
 * That is the only place the server-cache-vs-Query split can be proved: a jsdom
 * test cannot tell server output from client output, because it renders both.
 */
test.describe("server rendering", () => {
  test("the public page carries its content and its meta before any JS", async ({
    request,
  }) => {
    // The header is sent explicitly: the `request` fixture does not inherit the
    // project's `locale`, and next-intl negotiates from Accept-Language.
    const response = await request.get("/", {
      headers: { "Accept-Language": "vi" },
    });

    expect(response.status()).toBe(200);

    const html = await response.text();

    // Content a crawler reads.
    expect(html).toContain("Phân hệ");
    expect(html).toContain("Bảng điều khiển");
    // …and the metadata built from that same data.
    expect(html).toContain("<title>Phân hệ · Template Web</title>");
    expect(html).toContain('name="description"');
    expect(html).toContain('lang="vi"');
  });

  /**
   * Two assertions, deliberately split across two fixtures, because Next 16
   * under `cacheComponents` will not give you both in one response.
   *
   * `notFound()` throws before a static shell can be built, so the prerendered
   * document for the catch-all is an empty `__next_error__` shell carrying
   * `status: 404` (verifiable in `.next/server/app/vi/[...rest].meta`) which the
   * client then resumes into the real 404 UI. Forcing it to render at request
   * time instead — `await connection()` plus `instant: false` — does put the
   * localized copy in the bytes, but Next then answers **200**, because
   * `not-found.js` is documented as returning 200 for a *streamed* response and
   * 404 only for a non-streamed one.
   *
   * A soft 404 is the worse defect by a distance: the status is what crawlers,
   * uptime checks and link checkers act on, and a 200 tells all three the page
   * exists. So the app keeps the status, and the body is asserted where a reader
   * actually sees it — in a browser.
   */
  test("an unknown URL answers with a real 404 status, not a 200 that says 404", async ({
    request,
  }) => {
    const response = await request.get("/khong-ton-tai", {
      headers: { "Accept-Language": "vi" },
      // The status is the assertion; following a redirect would lose it.
      maxRedirects: 0,
    });

    expect(response.status()).toBe(404);
  });

  test("…and renders the localized 404 for the reader", async ({ page }) => {
    const response = await page.goto("/khong-ton-tai");

    // The status holds for a real navigation too, not just a bare fetch.
    expect(response?.status()).toBe(404);
    await expect(page.getByText("404 Không tìm thấy")).toBeVisible();
  });

  test("the guarded route redirects in the response itself", async ({
    request,
  }) => {
    // `maxRedirects: 0` is the whole test: following the redirect would land on
    // sign-in either way, and prove nothing about where the decision was made.
    const response = await request.get("/dashboard", {
      headers: { "Accept-Language": "vi" },
      maxRedirects: 0,
    });

    expect([302, 307]).toContain(response.status());
    expect(response.headers().location).toContain("/sign-in");
    expect(response.headers().location).toContain("redirectTo");
  });

  test("the English locale is served at its own prefix", async ({
    request,
  }) => {
    const response = await request.get("/en", {
      headers: { "Accept-Language": "en" },
    });

    expect(response.status()).toBe(200);

    const html = await response.text();

    expect(html).toContain("Modules");
    expect(html).toContain('lang="en"');
  });
});
