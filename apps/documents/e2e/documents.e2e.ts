import { expect, test } from "@playwright/test";

import { ROUTES } from "../src/constants/routes";

/**
 * The site is public: there is no session to seed and no guard to get past, so
 * every spec here starts at a URL a visitor could type.
 *
 * Paths come from the app's own `ROUTES` table rather than literals, so a
 * renamed route fails to compile instead of 404-ing at runtime — except where
 * the URL itself is the subject of the assertion.
 */
const PRIMITIVE_SLUG = "button";

test.describe("documents", () => {
  test("walks from the landing page to a primitive's page through the nav and a card", async ({
    page,
  }) => {
    await page.goto(ROUTES.HOME);

    await expect(
      page.getByRole("heading", { level: 1, name: "Bắt đầu" }),
    ).toBeVisible();

    // There is no sidebar: the pill's *Component* item leads to the list, and
    // the card there is generated from `packages/ui/src/components`, so it
    // only exists if the build ran the metadata script.
    await page
      .getByRole("navigation")
      .getByRole("link", { name: "Component", exact: true })
      .click();
    await page
      .getByRole("link", {
        name: new RegExp(`^${PRIMITIVE_SLUG} components/${PRIMITIVE_SLUG}`),
      })
      .click();

    await expect(page).toHaveURL(
      new RegExp(`${ROUTES.componentBySlugPath(PRIMITIVE_SLUG)}$`),
    );
    await expect(
      page.getByRole("heading", { level: 1, name: PRIMITIVE_SLUG }),
    ).toBeVisible();

    // The export table — the thing the page exists to show.
    await expect(
      page.getByRole("cell", { name: "Button", exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("cell", { name: "buttonVariants", exact: true }),
    ).toBeVisible();

    // And the import line a reader copies, spelled with the npm package name.
    await expect(
      page.getByText(`@fe-monorepo/ui/components/${PRIMITIVE_SLUG}`),
    ).toBeVisible();
  });

  test("opens the search palette from the keyboard and lands on the picked primitive", async ({
    page,
  }) => {
    await page.goto(ROUTES.HOOKS);

    // `Control+K` — the one listener accepts either modifier, and Chromium on
    // Linux (CI) has no Meta.
    await page.keyboard.press("Control+K");
    const palette = page.getByRole("dialog", { name: "Tìm trong tài liệu" });
    await expect(palette).toBeVisible();

    await palette
      .getByPlaceholder("Gõ tên component hoặc hook…")
      .fill("dialog");
    await page.keyboard.press("Enter");

    await expect(page).toHaveURL(
      new RegExp(`${ROUTES.componentBySlugPath("dialog")}$`),
    );
    await expect(
      page.getByRole("heading", { level: 1, name: "dialog" }),
    ).toBeVisible();
    await expect(palette).toBeHidden();
  });

  test("filters the component list down to one card and opens it", async ({
    page,
  }) => {
    await page.goto(ROUTES.COMPONENTS);

    await page.getByRole("searchbox", { name: "Lọc danh sách" }).fill("avatar");

    // The list filters on a debounced value, so this assertion is the one that
    // waits it out — Playwright retries it, no sleep needed.
    const card = page.getByRole("link", { name: /^avatar components\/avatar/ });
    await expect(card).toBeVisible();
    await card.click();

    await expect(
      page.getByRole("heading", { level: 1, name: "avatar" }),
    ).toBeVisible();
    await expect(
      page.getByRole("cell", { name: "Avatar", exact: true }),
    ).toBeVisible();
  });

  test("404s on a slug no primitive has", async ({ page }) => {
    // A literal path on purpose: what is asserted here is what happens to a URL
    // a visitor mistyped, so building it from ROUTES would assert nothing.
    await page.goto("/components/not-a-primitive");

    await expect(
      page.getByRole("heading", { level: 1, name: "Không tìm thấy" }),
    ).toBeVisible();
    await expect(page.getByText("not-a-primitive")).toBeVisible();
  });

  test("boots without a console error", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });

    await page.goto(ROUTES.HOME);
    await expect(
      page.getByRole("heading", { level: 1, name: "Bắt đầu" }),
    ).toBeVisible();

    // Vite bakes whatever is in the local .env without validating it, so a
    // missing or invalid `PUBLIC_DOCUMENTS_STORYBOOK_URL` only surfaces once
    // `createEnv` runs in the browser — this is what catches that boot failure.
    expect(errors).toEqual([]);
  });
});
