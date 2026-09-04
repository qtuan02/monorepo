import { expect, test } from "@playwright/test";

test.describe("locale switching", () => {
  test("keeps the visitor on the same page", async ({ page }) => {
    await page.goto("/");

    await expect(
      page.getByRole("heading", { level: 2, name: "Tool đang phục vụ" }),
    ).toBeVisible();

    await page.getByRole("combobox").click();
    await page.getByRole("option", { name: "Tiếng Anh" }).click();

    // The URL gains the prefix and the page stays the page — that is what
    // `router.replace(pathname, { locale })` buys over a link to "/en".
    await expect(page).toHaveURL(/\/en$/);
    await expect(
      page.getByRole("heading", { level: 2, name: "Tools it serves" }),
    ).toBeVisible();
  });
});
