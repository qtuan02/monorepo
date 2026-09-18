import { expect, test } from "@playwright/test";

import { ROUTES } from "../src/constants/routes";
import { formatFullDate } from "../src/utils/date";
import { signIn } from "./support/auth-session";

const homeHeading = formatFullDate();

// The dashboard sits behind the auth guard (see auth.e2e.ts), so every test
// here needs a session before the shell is reachable at all.
test.describe("dashboard", () => {
  test("keeps the session across a reload", async ({ page }) => {
    await signIn(page);
    await page.goto(ROUTES.HOME);
    await expect(
      page.getByRole("heading", { name: homeHeading }),
    ).toBeVisible();

    await page.reload();

    await expect(page).toHaveURL(new RegExp(`${ROUTES.HOME}$`));
    await expect(
      page.getByRole("heading", { name: homeHeading }),
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
      page.getByRole("heading", { name: homeHeading }),
    ).toBeVisible();

    // Vite bakes whatever is in the local .env without validating it, so a
    // PUBLIC_* key missing/invalid there only surfaces once createEnv runs in
    // the browser — this catches that boot failure, plus any other console
    // error on load (ADR-0011's `nameKey` fix on the donut legend is what
    // used to fail this very check — research C.1 #19).
    expect(errors).toEqual([]);
  });

  test("shows the Việc cần làm queue and the two charts, and re-reads them for a Building scope", async ({
    page,
  }) => {
    await signIn(page);
    await page.goto(ROUTES.HOME);

    // No trailing `$` — the priority badge ("Cao") sits inside the same
    // `ItemTitle` as the title text, right after it.
    await expect(
      page.getByText(/^Hoá đơn HÓA-\d+ quá hạn/).first(),
    ).toBeVisible();
    await expect(
      page.getByLabel("Biểu đồ tỷ lệ lấp đầy").locator("svg.recharts-surface"),
    ).toBeVisible();
    await expect(
      page
        .getByLabel("Biểu đồ doanh thu theo tháng")
        .locator("svg.recharts-surface"),
    ).toBeVisible();

    await page.getByRole("button", { name: "Trọ Sinh Viên Xanh" }).click();

    // Scoped to b1: its own "chưa lập Đợt" task stays, another Toà nhà's goes.
    await expect(
      page.getByText(/^Trọ Sinh Viên Xanh chưa lập Đợt hoá đơn/),
    ).toBeVisible();
    await expect(
      page.getByText(/^Chung cư Mini Lê Duẩn chưa lập Đợt hoá đơn/),
    ).not.toBeVisible();
  });

  test("navigates a Việc cần làm action to its entity", async ({ page }) => {
    await signIn(page);
    await page.goto(ROUTES.HOME);

    const item = page
      .locator('[role="listitem"]')
      .filter({ hasText: /^Hoá đơn HÓA-\d+ quá hạn/ })
      .first();
    await item.getByRole("link", { name: "Xem" }).click();

    await expect(
      page.getByRole("heading", { name: "Chi tiết hoá đơn" }),
    ).toBeVisible();
  });
});
