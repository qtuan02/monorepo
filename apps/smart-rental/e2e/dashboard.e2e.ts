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

  test("shows the gộp Việc cần làm queue and the three KPIs, re-read for a Building scope", async ({
    page,
  }) => {
    await signIn(page);
    await page.goto(ROUTES.HOME);

    await expect(page.getByText(/Còn phải thu tháng này/)).toBeVisible();
    await expect(page.getByText(/\d+ Hoá đơn quá hạn/).first()).toBeVisible();

    await page.getByRole("button", { name: "Trọ Sinh Viên Xanh" }).click();

    // Scoped to b1: its own gộp mục names its own Toà nhà.
    await expect(page.getByText(/Trọ Sinh Viên Xanh/).first()).toBeVisible();
  });

  test("expands a gộp mục and opens Ghi nhận thu prefilled with còn lại", async ({
    page,
  }) => {
    await signIn(page);
    await page.goto(ROUTES.HOME);

    const group = page
      .locator('[role="listitem"]')
      .filter({ hasText: /Hoá đơn quá hạn/ })
      .first();
    await group.getByRole("button", { name: /Xem \d+ hoá đơn/ }).click();
    await group.getByRole("button", { name: "Ghi nhận thu" }).first().click();

    await expect(
      page.getByRole("heading", { name: "Ghi nhận Thanh toán" }),
    ).toBeVisible();
    const amountInput = page.getByLabel("Số tiền");
    await expect(amountInput).not.toHaveValue("");
  });
});
