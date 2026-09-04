import { expect, test } from "@playwright/test";

import { ROUTES } from "../src/constants/routes";

/**
 * The `request` fixture fetches the document with **no browser and no
 * hydration**, so anything asserted here demonstrably came from the server.
 *
 * That is the whole promise of putting a CV on the Next Runtime: a recruiter's
 * crawler, a LinkedIn unfurl and a search index all read the first bytes and
 * never run the page's JavaScript. A jsdom test cannot tell server output from
 * client output, because it renders both.
 */
test.describe("server rendering", () => {
  test("the CV is in the first HTML, with its metadata", async ({
    request,
  }) => {
    // The header is sent explicitly: the `request` fixture does not inherit the
    // project's `locale`, and next-intl negotiates from Accept-Language.
    const response = await request.get(ROUTES.HOME, {
      headers: { "Accept-Language": "vi" },
    });

    expect(response.status()).toBe(200);

    const html = await response.text();

    // The greeting, which comes from the shell-adjacent hero section…
    expect(html).toContain("Xin chào, mình là Tuấn");
    // …and one bullet from inside a work row, which is the assertion that
    // actually matters: a heading could come from the layout, but a bullet is
    // only there if the slice itself rendered on the server.
    expect(html).toContain("Social Protection System");
    expect(html).toContain("Kinh nghiệm làm việc");

    // The metadata built from the same catalogue.
    expect(html).toContain("<title>Huỳnh Quốc Tuấn</title>");
    expect(html).toContain('name="description"');
    expect(html).toContain('lang="vi"');
  });

  test("the social card image is an absolute URL", async ({ request }) => {
    const response = await request.get(ROUTES.HOME, {
      headers: { "Accept-Language": "vi" },
    });
    const html = await response.text();

    // `metadataBase` is what turns the relative `/og-image.jpg` into an absolute
    // URL — and it is the reason `NEXT_PUBLIC_PORTFOLIO_BASE_DOMAIN` is a
    // required variable. A relative og:image is ignored by every unfurler.
    expect(html).toMatch(
      /<meta property="og:image" content="https?:\/\/[^"]+\/og-image\.jpg"/,
    );
  });

  test("robots.txt points at the sitemap and the sitemap lists both locales", async ({
    request,
  }) => {
    const robots = await request.get("/robots.txt");

    expect(robots.status()).toBe(200);
    expect(await robots.text()).toContain("/sitemap.xml");

    const sitemap = await request.get("/sitemap.xml");

    expect(sitemap.status()).toBe(200);

    const xml = await sitemap.text();

    // `localePrefix: "as-needed"` — the default language at the bare path, the
    // other one prefixed — stated to a crawler through the alternates map.
    expect(xml).toContain('hreflang="vi"');
    expect(xml).toContain('hreflang="en"');
    expect(xml).toMatch(/<xhtml:link[^>]+href="https?:\/\/[^"]+\/en"/);
  });

  test("the web app manifest is served", async ({ request }) => {
    const response = await request.get("/manifest.webmanifest");

    expect(response.status()).toBe(200);
    expect(await response.text()).toContain("Huỳnh Quốc Tuấn");
  });

  /**
   * Two assertions, deliberately split across two fixtures, because Next 16
   * under `cacheComponents` will not give you both in one response.
   *
   * `notFound()` throws before a static shell can be built, so the prerendered
   * document for the catch-all is an empty shell carrying `status: 404` which
   * the client then resumes into the real 404 UI. Forcing it to render at
   * request time instead does put the localized copy in the bytes, but Next then
   * answers **200**, because `not-found.js` is documented as returning 200 for a
   * streamed response.
   *
   * A soft 404 is the worse defect by a distance: the status is what crawlers,
   * uptime checks and link checkers act on. So the app keeps the status, and the
   * body is asserted where a reader actually sees it — in a browser.
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
});
