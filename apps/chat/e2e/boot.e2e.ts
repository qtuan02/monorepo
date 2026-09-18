import { expect, test } from "@playwright/test";

import { ROUTES } from "../src/constants/routes";

/**
 * The skeleton this ticket ships: no screen lands inside `ProtectedRoute`
 * yet, so `/` and any unknown path both fall through to the catch-all
 * sibling route and render `NotFound` — see `~/pages/main.tsx`. Real guard
 * behaviour (redirect to sign-in, a real launcher) arrives with the Session
 * ticket and gets its own `e2e/auth.e2e.ts`.
 */
test.describe("boot — empty shell", () => {
  test("shows 404 at the root", async ({ page }) => {
    await page.goto(ROUTES.HOME);

    await expect(
      page.getByRole("heading", { name: "404 Not Found" }),
    ).toBeVisible();
  });

  test("shows 404 at an unknown path", async ({ page }) => {
    await page.goto("/some-unknown-path");

    await expect(
      page.getByRole("heading", { name: "404 Not Found" }),
    ).toBeVisible();
  });

  test("boots without a console error", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });

    await page.goto(ROUTES.HOME);
    await expect(
      page.getByRole("heading", { name: "404 Not Found" }),
    ).toBeVisible();

    // Vite bakes whatever is in the local .env without validating it, so a
    // PUBLIC_* key missing/invalid there only surfaces once createEnv runs in
    // the browser — this catches that boot failure, plus any other console
    // error on load.
    expect(errors).toEqual([]);
  });
});
