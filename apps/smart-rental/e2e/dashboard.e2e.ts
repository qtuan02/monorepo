import { expect, test } from "@playwright/test";

import { ROUTES } from "../src/constants/routes";
import { signIn } from "./support/auth-session";

// The dashboard sits behind the auth guard (see auth.e2e.ts), so every test
// here needs a session before the shell is reachable at all.
test.describe("dashboard", () => {
  test("keeps the session across a reload", async ({ page }) => {
    await signIn(page);
    await page.goto(ROUTES.HOME);
    await expect(
      page.getByRole("heading", { name: "Tổng quan" }),
    ).toBeVisible();

    await page.reload();

    await expect(page).toHaveURL(new RegExp(`${ROUTES.HOME}$`));
    await expect(
      page.getByRole("heading", { name: "Tổng quan" }),
    ).toBeVisible();
  });

  test("boots without a console error", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });

    await signIn(page);
    await page.goto(ROUTES.HOME);
    await expect(
      page.getByRole("heading", { name: "Tổng quan" }),
    ).toBeVisible();

    // Vite bakes whatever is in the local .env without validating it, so a
    // PUBLIC_* key missing/invalid there only surfaces once createEnv runs in
    // the browser — this catches that boot failure, plus any other console
    // error on load.
    expect(errors).toEqual([]);
  });

  test("draws the summary and three charts, and re-reads them for a Building scope", async ({
    page,
  }) => {
    await signIn(page);
    await page.goto(ROUTES.HOME);

    // The totals, and the three charts as real SVG — the seam a jsdom test
    // cannot reach, since recharts measures its container.
    await expect(page.getByText("145", { exact: true })).toBeVisible();
    await expect(page.getByText("545.2tr")).toBeVisible();
    await expect(
      page
        .getByLabel("Biểu đồ doanh thu theo tháng")
        .locator("svg.recharts-surface"),
    ).toBeVisible();
    await page.getByRole("tab", { name: "Thu vs Chi" }).click();
    await expect(
      page
        .getByLabel("Biểu đồ thu chi theo tháng")
        .locator("svg.recharts-surface"),
    ).toBeVisible();
    await expect(
      page.getByLabel("Biểu đồ tỷ lệ lấp đầy").locator("svg.recharts-surface"),
    ).toBeVisible();

    await page.getByRole("combobox", { name: "Toà nhà" }).click();
    await page.getByRole("option", { name: "Trọ Sinh Viên Xanh" }).click();

    await expect(page.getByText("15", { exact: true })).toBeVisible();
    await expect(page.getByText("54.5tr")).toBeVisible();
    await expect(page.getByText("145", { exact: true })).not.toBeVisible();
  });
});
