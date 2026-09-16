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
});
