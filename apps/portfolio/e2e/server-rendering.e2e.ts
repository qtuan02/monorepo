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
    // The literal `/vi` rather than `ROUTES.HOME`: English is this app's
    // default and sits at the bare path (see `~/i18n/routing.ts`), so the
    // Vietnamese document is the prefixed one — and asking for it directly is
    // what keeps this a test of the rendering rather than of a redirect. The
    // header is still sent: the `request` fixture does not inherit the
    // project's `locale`.
    const response = await request.get("/vi", {
      headers: { "Accept-Language": "vi" },
    });

    expect(response.status()).toBe(200);

    const html = await response.text();

    // The name — the hero's h1 — and the command that introduces it, which is
    // code and so reads the same in every locale…
    expect(html).toContain("Huỳnh Quốc Tuấn");
    expect(html).toContain("whoami");
    // …and the line that says what the candidate actually does. This one is
    // the page's whole job in an unfurl preview and in the first five seconds
    // of a scroll, so it has to be in the bytes rather than hydrated in.
    expect(html).toContain("Software Engineer");
    expect(html).toContain("Đam mê công nghệ mới");
    // The about section's opening line — the "3+ years, Software Engineer"
    // claim has to be in the bytes, not hydrated in, or a crawler indexes the
    // stale "2+ years, Frontend Developer" title this ticket retired.
    expect(html).toContain("Software Engineer với 3+ năm kinh nghiệm");
    // …and one bullet from inside the current work row, which is the assertion
    // that actually matters: a heading could come from the layout, but a bullet
    // is only there if the slice itself rendered on the server.
    expect(html).toContain("app EMR mobile bằng Expo/React Native");
    // The health-examination bullet split out from the monorepo one, and the
    // company blurb beside it — both new in this ticket, both have to be in
    // the bytes or a crawler never sees the biggest thing on the CV.
    expect(html).toContain("cổng tự phục vụ không mật khẩu cho người bệnh");
    expect(html).toContain("Sản phẩm EMR/HIS cho bệnh viện");
    expect(html).toContain("Kinh nghiệm làm việc");
    // A skill group label and a name that only exists inside it. Tabs would
    // have put four rows in five out of these bytes; this is the assertion
    // that the section stayed readable in one pass.
    expect(html).toContain("Công cụ");
    expect(html).toContain("Biome");
    // …and a bullet from the LAST row, which the section renders folded. The
    // accordion only animates the body's height, so a folded role is still in
    // the bytes a crawler reads — the whole reason progressive disclosure was
    // safe to add here. Assert it on the oldest row, the one furthest from
    // `defaultExpanded`.
    expect(html).toContain("Highlands Coffee");
    // That three roles ship and no more is pinned in the Gate rather than here:
    // `test/features/home/constants/resume.test.ts` fixes the whole id list, and
    // the orphan check in the same file fails any catalogue key no component
    // reads. Naming the dropped companies in an assertion would have put those
    // strings back into the repo — the one thing the rebuild set out to remove —
    // and would only have caught the three already thought of.

    // The metadata built from the same catalogue. The title carries the role,
    // not the bare name: a tab, a bookmark and a search result all render this
    // one string, and a name alone tells a stranger nothing.
    expect(html).toContain(
      "<title>Huỳnh Quốc Tuấn — Software Engineer</title>",
    );
    expect(html).toContain('name="description"');
    expect(html).toContain('lang="vi"');

    // The two languages serve the same content at two URLs, so a crawler is
    // free to call them duplicates and pick a winner unless the canonical and
    // the hreflang map say otherwise. Only the raw document shows these — they
    // are `<link>` tags Next writes from `alternates`, not anything a rendered
    // page displays.
    expect(html).toContain('rel="canonical"');
    // Matched case-insensitively: React emits the JSX prop name `hrefLang`
    // verbatim, and an HTML attribute name is case-insensitive — so a literal
    // would pin React's spelling rather than the tag the crawler reads.
    for (const hreflang of ["vi", "en", "x-default"]) {
      expect(html, hreflang).toMatch(new RegExp(`hreflang="${hreflang}"`, "i"));
    }

    // The `Person` structured data: the half of SEO no `<meta>` expresses, and
    // invisible in a browser whether it is right, wrong or unparseable.
    const jsonLd = html.match(
      /<script type="application\/ld\+json"[^>]*>(.*?)<\/script>/s,
    );

    expect(jsonLd?.[1]).toBeTruthy();
    expect(JSON.parse(jsonLd?.[1] ?? "")).toMatchObject({
      "@type": "Person",
      name: "Huỳnh Quốc Tuấn",
      jobTitle: "Software Engineer",
    });
  });

  test("…and in English at the bare path, with the same row gone", async ({
    request,
  }) => {
    const response = await request.get(ROUTES.HOME, {
      headers: { "Accept-Language": "en" },
    });

    expect(response.status()).toBe(200);

    const html = await response.text();

    // The `en` half of the same bullet: a work row that renders on the server
    // in one locale and falls back to a key path in the other is exactly what a
    // missing translation looks like, and only the raw document shows it.
    expect(html).toContain("EMR mobile app with Expo/React Native");
    expect(html).toContain("passwordless self-service patient portal");
    expect(html).toContain("EMR/HIS product for hospitals");
    expect(html).toContain(
      "Driven by new technology, learning every day, and turning ideas into products that ship.",
    );
    expect(html).toContain("Software Engineer with 3+ years of experience");
  });

  test("the social card is an absolute URL to a generated image, per locale", async ({
    request,
  }) => {
    // `metadataBase` is what turns the route Next emits into an absolute URL —
    // and it is the reason `NEXT_PUBLIC_PORTFOLIO_BASE_DOMAIN` is a required
    // variable. A relative og:image is ignored by every unfurler.
    const absoluteImage =
      /<meta property="og:image" content="(https?:\/\/[^"]+\/opengraph-image[^"]*)"/;

    for (const [path, lang] of [
      ["/vi", "vi"],
      [ROUTES.HOME, "en"],
    ] as const) {
      const html = await (
        await request.get(path, { headers: { "Accept-Language": lang } })
      ).text();

      const imageUrl = html.match(absoluteImage)?.[1];
      if (!imageUrl) {
        throw new Error(`no absolute og:image in the document at ${path}`);
      }
      // The card is generated under the locale segment, so the URL says which
      // language it renders in — that is what makes the `/vi` share card
      // Vietnamese without a second static file. Note the segment is there even
      // for the default locale, whose *page* has no prefix.
      expect(imageUrl).toContain(`/${lang}/opengraph-image`);
      // The card serves Twitter/X too; there is no separate twitter-image.
      expect(html).toContain('name="twitter:image"');

      // The absolute URL points at the deployed origin, not this server — so
      // its path is fetched here. `maxRedirects: 0` is the assertion that
      // matters: an unfurler must get the bytes on the first request, and
      // `as-needed` would 307 the default locale's image without the pass-
      // through in `proxy.ts`.
      const { pathname, search } = new URL(imageUrl);
      const image = await request.get(`${pathname}${search}`, {
        maxRedirects: 0,
      });

      expect(image.status(), `status of ${pathname}`).toBe(200);
      expect(image.headers()["content-type"]).toBe("image/png");
    }
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
    expect(xml).toMatch(/<xhtml:link[^>]+href="https?:\/\/[^"]+\/vi"/);
  });

  test("the web app manifest is served", async ({ request }) => {
    const response = await request.get("/manifest.webmanifest");

    expect(response.status()).toBe(200);
    // The app's default locale, which is English here — the manifest names
    // the app once, in the language the bare path serves.
    expect(await response.text()).toContain("Huynh Quoc Tuan");
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
    // The prefixed path, not the bare one: English is the default here, so
    // `/khong-ton-tai` with a Vietnamese `Accept-Language` is a 307 to `/vi`
    // before it is anything else, and the status under test would be lost.
    const response = await request.get("/vi/khong-ton-tai", {
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
    // The bare path is English (`localeDetection: false`, see
    // `~/i18n/routing.ts`), so this is the copy a reader gets — "localized"
    // still means *from the catalogue*, which is what the assertion is for.
    await expect(page.getByText("404 Not Found")).toBeVisible();
  });

  test("the projects are in the first HTML, in both languages", async ({
    request,
  }) => {
    // A project row is the piece a recruiter's crawler is most likely to
    // index — the repo names and demo URLs — so it must be in the bytes the
    // server sends, not something that arrives once the client has run.
    const vi = await request.get("/vi", {
      headers: { "Accept-Language": "vi" },
    });

    expect(vi.status()).toBe(200);

    const viHtml = await vi.text();

    expect(viHtml).toContain("Dự án cá nhân");
    // The monorepo has no card of its own (#269) and, since #274, no framing
    // note either — its address reaches the bytes through each project's own
    // "Mã nguồn" href, which is the only place it was ever verifiable.
    expect(viHtml).toContain("github.com/qtuan02/monorepo");
    expect(viHtml).toContain("Real-time Chat");
    expect(viHtml).toContain(
      'href="https://github.com/qtuan02/monorepo/tree/main/apps/chat"',
    );
    expect(viHtml).toContain('href="https://chat-socket-ui.vercel.app"');
    expect(viHtml).toContain('href="https://documents-ui.vercel.app"');

    // English is the default, so its document is the unprefixed one — the
    // path `~/constants/routes` holds.
    const en = await request.get(ROUTES.HOME, {
      headers: { "Accept-Language": "en" },
    });

    expect(en.status()).toBe(200);
    expect(await en.text()).toContain("Personal Projects");
  });
});
