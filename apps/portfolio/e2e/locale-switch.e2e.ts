import { expect, test } from "@playwright/test";

import { ROUTES } from "../src/constants/routes";

/**
 * `localePrefix: "as-needed"`: the default language (`vi`) is served at the bare
 * path and every other one carries its prefix. Both halves are asserted on the
 * raw document first — that prefix rule is a **server** decision, made by
 * `proxy.ts` before anything renders — and then through the switcher, which is
 * the only way a visitor ever exercises it.
 */
test.describe("locale switching", () => {
  test("serves the default language at the bare path", async ({ request }) => {
    const response = await request.get(ROUTES.HOME, {
      headers: { "Accept-Language": "vi" },
    });

    expect(response.status()).toBe(200);

    const html = await response.text();

    expect(html).toContain('lang="vi"');
    expect(html).toContain("Xin chào, mình là Tuấn");
  });

  test("serves English at its own prefix", async ({ request }) => {
    // The literal path is the assertion here — this test is about the URL a
    // visitor lands on, which is exactly the case `~/constants/routes` cannot
    // express, since it holds unprefixed paths by design.
    const response = await request.get("/en", {
      headers: { "Accept-Language": "en" },
    });

    expect(response.status()).toBe(200);

    const html = await response.text();

    expect(html).toContain('lang="en"');
    expect(html).toContain("Hi, I am Tuan");
    expect(html).toContain("Work Experience");
  });

  test("the switcher keeps the visitor on the same page", async ({ page }) => {
    await page.goto(ROUTES.HOME);

    await expect(
      page.getByRole("heading", { level: 1, name: /Xin chào, mình là Tuấn/ }),
    ).toBeVisible();

    await page.getByRole("combobox").click();
    await page.getByRole("option", { name: "Tiếng Anh" }).click();

    // The URL gains the prefix and the page stays the page — that is what
    // `router.replace(pathname, { locale })` buys over a link to "/en".
    await expect(page).toHaveURL(/\/en$/);
    // The h1, not `getByText`: Next's route announcer mirrors the page heading
    // into an `aria-live` region on every client navigation, so a bare text
    // match resolves to two elements after the switch.
    await expect(
      page.getByRole("heading", { level: 1, name: /Hi, I am Tuan/ }),
    ).toBeVisible();
  });
});
