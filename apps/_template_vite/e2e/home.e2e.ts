import { expect, test } from "@playwright/test";

import { signIn } from "./support/auth-session";

// The launcher sits behind the auth guard (see auth.e2e.ts), so every test
// here needs a session before the shell is reachable at all.
test.describe("home", () => {
  test("loads and renders the app shell", async ({ page }) => {
    await signIn(page);
    await page.goto("/");

    await expect(page.getByRole("banner")).toBeVisible();
  });

  test("boots without a console error", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });

    await signIn(page);
    await page.goto("/");
    await expect(page.getByRole("banner")).toBeVisible();

    // Vite bakes whatever is in the local .env without validating it, so a
    // PUBLIC_* key missing/invalid there only surfaces once createEnv runs in
    // the browser — this catches that boot failure, plus any other console
    // error on load.
    expect(errors).toEqual([]);
  });
});
