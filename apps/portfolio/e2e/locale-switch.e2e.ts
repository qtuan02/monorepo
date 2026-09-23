import { expect, test } from "@playwright/test";

import { ROUTES } from "../src/constants/routes";

/**
 * `localePrefix: "as-needed"` plus `localeDetection: false`: the URL alone
 * decides the language. This app's default is **English**, not the registry's
 * `vi` (see `~/i18n/routing.ts`), so `/` is English and Vietnamese lives at
 * `/vi` — the mirror of every other app in the workspace, which is exactly the
 * kind of inversion a shared default hides.
 *
 * Both halves are asserted on the raw document first, with an `Accept-Language`
 * that asks for the *other* language: that is the assertion, not decoration.
 * With detection left on, next-intl reads the header before the default
 * applies, and `/` answers differently for every visitor — which is the bug
 * this file exists to catch. Then through the switcher, the only way a visitor
 * ever changes it.
 */
test.describe("locale switching", () => {
  test("serves English at the bare path, whatever the browser asks for", async ({
    request,
  }) => {
    const response = await request.get(ROUTES.HOME, {
      // Asking for Vietnamese: the default has to win anyway…
      headers: { "Accept-Language": "vi" },
      // …and win here, not after a detour. A 307 is the old behaviour.
      maxRedirects: 0,
    });

    expect(response.status()).toBe(200);

    const html = await response.text();

    expect(html).toContain('lang="en"');
    // A line from the hero's body rather than the name: the name is also the
    // document title, so it would be in these bytes with no hero at all.
    expect(html).toContain(
      "Driven by new technology, learning every day, and turning ideas into products that ship.",
    );
    expect(html).toContain("Work Experience");
  });

  test("serves Vietnamese at its own prefix, whatever the browser asks for", async ({
    request,
  }) => {
    // The literal path is the assertion here — this test is about the URL a
    // visitor lands on, which is exactly the case `~/constants/routes` cannot
    // express, since it holds unprefixed paths by design.
    const response = await request.get("/vi", {
      headers: { "Accept-Language": "en" },
      maxRedirects: 0,
    });

    expect(response.status()).toBe(200);

    const html = await response.text();

    expect(html).toContain('lang="vi"');
    expect(html).toContain(
      "Đam mê công nghệ mới, học mỗi ngày, và biến ý tưởng thành sản phẩm chạy thật.",
    );
  });

  test("the switcher keeps the visitor on the same page", async ({ page }) => {
    // The prefixed path: the project's `locale: "vi-VN"` no longer buys a
    // Vietnamese document, because nothing but the URL decides one.
    await page.goto("/vi");

    await expect(
      page.getByRole("heading", { level: 1, name: "Huỳnh Quốc Tuấn" }),
    ).toBeVisible();

    await page.getByRole("combobox").click();
    await page.getByRole("option", { name: "Tiếng Anh" }).click();

    // The URL *loses* its prefix — English is the default now — and the page
    // stays the page, which is what `router.replace(pathname, { locale })`
    // buys over a link to a literal path.
    await expect(page).not.toHaveURL(/\/vi$/);
    // The h1, not `getByText`: Next's route announcer mirrors the page heading
    // into an `aria-live` region on every client navigation, so a bare text
    // match resolves to two elements after the switch.
    await expect(
      page.getByRole("heading", { level: 1, name: "Huynh Quoc Tuan" }),
    ).toBeVisible();
  });
  test("keeps the dark theme across the switch", async ({ page }) => {
    // The root layout remounts on a language switch and <html> comes back
    // bare; the provider has to put the stored theme back (#126).
    await page.addInitScript(() => {
      window.localStorage.setItem("theme", "dark");
    });
    await page.goto("/vi");
    await expect(page.locator("html")).toHaveClass(/\bdark\b/);

    await page.getByRole("combobox").click();
    await page.getByRole("option", { name: "Tiếng Anh" }).click();
    await expect(
      page.getByRole("heading", { level: 1, name: "Huynh Quoc Tuan" }),
    ).toBeVisible();

    await expect(page.locator("html")).toHaveClass(/\bdark\b/);
  });
});
