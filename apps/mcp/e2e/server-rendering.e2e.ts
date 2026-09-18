import { expect, test } from "@playwright/test";

/**
 * The `request` fixture fetches the document with **no browser and no
 * hydration**, so anything asserted here demonstrably came from the server.
 */
test.describe("server rendering", () => {
  test("the placeholder page carries its content and its meta before any JS", async ({
    request,
  }) => {
    // The header is sent explicitly: the `request` fixture does not inherit the
    // project's `locale`, and next-intl negotiates from Accept-Language.
    const response = await request.get("/", {
      headers: { "Accept-Language": "vi" },
    });

    expect(response.status()).toBe(200);

    const html = await response.text();

    // The three tool names come from the same array the MCP server registers,
    // so a tool renamed on one side and not the other fails here.
    expect(html).toContain("hello-world");
    expect(html).toContain("get-weather");
    expect(html).toContain("get-forecast");
    expect(html).toContain("<title>MCP Weather</title>");
    expect(html).toContain('name="description"');
    expect(html).toContain('lang="vi"');
  });

  /**
   * Two assertions, deliberately split across two fixtures, because Next 16
   * under `cacheComponents` will not give you both in one response — the
   * prerendered document for the catch-all is an empty `__next_error__` shell
   * carrying `status: 404` which the client resumes into the real 404 UI. The
   * status is what crawlers and monitors act on, so it is asserted on the raw
   * response and the copy is asserted where a reader sees it.
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

    expect(response?.status()).toBe(404);
    await expect(page.getByText("404 Không tìm thấy")).toBeVisible();
  });

  test("the guarded route redirects in the response itself", async ({
    request,
  }) => {
    // `maxRedirects: 0` is the whole test: following the redirect would land on
    // sign-in either way, and prove nothing about where the decision was made.
    // The guard is kept from the Template on purpose — this app has a dashboard
    // behind it, and `/api/mcp` is outside the proxy's matcher either way.
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

    expect(html).toContain("Tools it serves");
    expect(html).toContain('lang="en"');
  });
});
