import { expect, test } from "@playwright/test";

/**
 * The public pages, asserted on what `react-router-serve` actually sends. Every
 * raw-document case here reads the response through the `request` fixture — no
 * browser, no hydration — so a module title, a 404 status or a prerendered
 * body that passes demonstrably came from the server, not from JavaScript that
 * ran after paint. That is the property user stories 11–15 of the spec are
 * about, and the only seam that can prove it.
 *
 * The `request` fixture inherits neither the project's `locale` nor a cookie
 * jar, so each case sends its own `Accept-Language`.
 */
const VI = { "Accept-Language": "vi-VN,vi;q=0.9" };

// The six titles the catalogue renders, in the language above. Spelled out
// rather than read from the catalogue: what is asserted is the contract with a
// crawler, and a spec importing the same source the server renders from would
// keep passing if both changed together.
const MODULE_TITLES = [
  "Bảng điều khiển",
  "Hệ thống POS",
  "Quản lý bệnh nhân",
  "Quản lý thuốc",
  "Thống kê & Báo cáo",
  "Lịch hẹn",
];

test.describe("home catalogue", () => {
  test("puts every module in the first HTML, as a link to its own page", async ({
    request,
  }) => {
    const response = await request.get("/", { headers: VI });

    expect(response.status()).toBe(200);

    const html = await response.text();

    // The whole catalogue is in the payload the loader produced — nothing here
    // waits for a TanStack Query to resolve after paint. `&` is what React
    // emits for the ampersand in a text node, so the one title carrying it is
    // matched on its escaped form.
    for (const title of MODULE_TITLES) {
      expect(html).toContain(title.replace("&", "&amp;"));
    }
    // A real anchor to a real URL, built by `href("/modules/:slug")`: the card
    // is followable before any JavaScript, which is what makes each module
    // page discoverable from the home page at all.
    expect(html).toMatch(/<a[^>]+href="\/modules\/dashboard"/);
    // An unbuilt module is a link too — its page is where "not built yet" is
    // said, so the URL the catalogue advertises must exist.
    expect(html).toMatch(/<a[^>]+href="\/modules\/pos"/);
    // And `meta` built its keywords from the same loader data as the grid.
    expect(html).toMatch(/name="keywords"[^>]*content="[^"]*Bảng điều khiển/);
  });
});

test.describe("module pages", () => {
  test("serves a built module on its own URL with its own title", async ({
    request,
  }) => {
    const response = await request.get("/modules/dashboard", { headers: VI });

    expect(response.status()).toBe(200);

    const html = await response.text();

    // The tab is the module's title — one indexable URL per module, each with
    // its own `<title>` and description (user story 12).
    expect(html).toContain("<title>Bảng điều khiển</title>");
    expect(html).toMatch(
      /name="description"[^>]*content="Quản lý bệnh nhân, lịch hẹn/,
    );
    // The way into the screen is a link the server rendered, aimed through
    // `href("/dashboard")`.
    expect(html).toMatch(/<a[^>]+href="\/dashboard"/);
  });

  test("serves an unbuilt module as a page that says so, not as a 404", async ({
    request,
  }) => {
    const response = await request.get("/modules/pos", { headers: VI });

    // The home page links here, and a URL the app itself advertises must not
    // tell a crawler it is gone.
    expect(response.status()).toBe(200);

    const html = await response.text();

    expect(html).toContain("<title>Hệ thống POS</title>");
    expect(html).toContain("Đang phát triển");
    expect(html).not.toMatch(/<a[^>]+href="\/dashboard"/);
  });

  test("answers an unknown slug with a real 404 and the localized screen inside the shell", async ({
    request,
  }) => {
    const response = await request.get("/modules/khong-co", {
      headers: VI,
      // The status is the assertion; following a redirect would lose it.
      maxRedirects: 0,
    });

    // The loader threw `data(null, { status: 404 })`, and the server runtime
    // put that status on the document — so a crawler drops the URL instead of
    // indexing a 200 page that merely says 404.
    expect(response.status()).toBe(404);

    const html = await response.text();

    // Unlike the Next Template, whose catch-all answers 404 with an empty shell
    // the client resumes, this Runtime renders the route's `ErrorBoundary` on
    // the server: the body and the status arrive together.
    expect(html).toContain("404 Không tìm thấy");
    expect(html).toContain("<title>404 Không tìm thấy</title>");
    // The route-level boundary is what keeps the shell: root's boundary would
    // have replaced the header. The brand link is the header's landmark — the
    // brand name has to sit INSIDE an anchor to `/`, not merely after one.
    expect(html).toMatch(/<a[^>]+href="\/"[^>]*>(?:(?!<\/a>)[\s\S])*Monorepo/);
  });
});

test.describe("catch-all 404", () => {
  test("answers a mistyped path with a real 404 status and the localized body", async ({
    request,
  }) => {
    const response = await request.get("/khong-ton-tai", {
      headers: VI,
      maxRedirects: 0,
    });

    // The splat's loader RETURNED `data(null, { status: 404 })`; the component
    // is the 404 screen itself, so both halves are in one response.
    expect(response.status()).toBe(404);

    const html = await response.text();

    expect(html).toContain("404 Không tìm thấy");
    expect(html).toContain("<title>404 Không tìm thấy</title>");
  });

  test("…and the reader sees it inside the shell, with the way out", async ({
    page,
  }) => {
    const response = await page.goto("/khong-ton-tai");

    // The status holds for a real navigation too, not just a bare fetch.
    expect(response?.status()).toBe(404);
    await expect(
      page.getByRole("heading", { level: 1, name: "404 Không tìm thấy" }),
    ).toBeVisible();
    // The shell is still around it: the splat sits INSIDE the layout route and
    // OUTSIDE the guard, so a mistyped URL neither loses the header nor bounces
    // to sign-in.
    await expect(page.getByRole("link", { name: "Monorepo" })).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Về trang chủ" }),
    ).toHaveAttribute("href", "/");
  });
});

/**
 * `/about` is the one entry in `react-router.config.ts`'s `prerender`, and with
 * `ssr: true` the build writes `build/client/about/index.html` and
 * `build/client/about.data`. `react-router-serve` mounts `express.static` over
 * `build/client` BEFORE its request handler, so those files answer first and
 * the server render never runs for this route. Two consequences follow from
 * express.static's defaults, and both are asserted rather than worked around:
 *
 * - `GET /about` names a DIRECTORY, so express.static answers **301** to
 *   `/about/` (its `redirect` option) — the request handler is never reached.
 * - `GET /about/` serves `about/index.html` from disk with **200**, and
 *   `GET /about.data` serves the navigation payload the same way.
 *
 * Because the file was rendered at build time, it carries the BUILD's language
 * — the registry default — not the visitor's. A per-request language is
 * exactly what a prerendered page cannot have, so that is asserted as the
 * proof of "served from disk" rather than treated as a defect.
 */
test.describe("prerendered about page", () => {
  test("redirects the bare path to its directory form, from static middleware", async ({
    request,
  }) => {
    const response = await request.get("/about", {
      headers: VI,
      maxRedirects: 0,
    });

    expect(response.status()).toBe(301);
    expect(response.headers().location).toMatch(/\/about\/$/);
  });

  test("serves the directory form from disk, complete", async ({ request }) => {
    const response = await request.get("/about/", { headers: VI });

    expect(response.status()).toBe(200);

    const html = await response.text();

    expect(html).toContain("<title>Giới thiệu — Monorepo</title>");
    expect(html).toContain("Prerender lúc build");
  });

  test("keeps the build's language regardless of the request's", async ({
    request,
  }) => {
    // The one page in the app that does NOT follow `Accept-Language`, and that
    // is the evidence it was never server rendered for this request: root's
    // middleware, which negotiates the language, ran once at build time.
    const response = await request.get("/about/", {
      headers: { "Accept-Language": "en-GB,en;q=0.9" },
    });

    expect(response.status()).toBe(200);

    const html = await response.text();

    expect(html).toMatch(/<html[^>]*\slang="vi"/);
    expect(html).toContain("<title>Giới thiệu — Monorepo</title>");
  });

  test("serves the navigation payload off disk too", async ({ request }) => {
    const response = await request.get("/about.data", { headers: VI });

    expect(response.status()).toBe(200);
  });

  test("honours a stored language choice after hydration, and keeps the cookie", async ({
    page,
    context,
    baseURL,
  }) => {
    // The one page where the server's language and the visitor's stored choice
    // can disagree: the file on disk says `vi`, the cookie says `en`. The
    // pre-hydration switch in `entry.client` has to follow the file (or the
    // markup would mismatch) — and that switch re-writes the cookie. What is
    // asserted is that the choice comes back afterwards, on the page AND in the
    // cookie, so the next server render does not silently flip to Vietnamese.
    await context.addCookies([
      { name: "template_reactrouter_lang", value: "en", url: baseURL ?? "" },
    ]);

    await page.goto("/about/");

    await expect(
      page.getByRole("heading", { level: 1, name: "About" }),
    ).toBeVisible();
    await expect(page.locator("html")).toHaveAttribute("lang", "en");

    const cookie = (await context.cookies()).find(
      (candidate) => candidate.name === "template_reactrouter_lang",
    );
    expect(cookie?.value).toBe("en");

    // A full navigation to a server-rendered page: negotiated off the cookie,
    // so it must come back in English too.
    await page.goto("/");

    await expect(
      page.getByRole("heading", { level: 1, name: "React Router Template" }),
    ).toBeVisible();
  });
});
