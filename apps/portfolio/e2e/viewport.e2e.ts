import { expect, test } from "@playwright/test";

import { ROUTES } from "../src/constants/routes";

/**
 * The narrowest phone the CV is expected on. Contact and Hobbies used to sit in
 * two rigid flex columns, and the email address alone pushed the left one past
 * this width — a defect a jsdom test cannot see, because jsdom lays nothing out.
 */
const PHONE_WIDTH = 375;

test.describe("viewport", () => {
  test("never scrolls sideways on a 375 px phone", async ({ page }) => {
    await page.setViewportSize({ width: PHONE_WIDTH, height: 800 });
    await page.goto(ROUTES.HOME);

    // Wait for the last section to be on the page before measuring: the
    // sections fade in, but they are in the DOM from the first paint.
    await expect(
      page.getByRole("heading", { level: 2, name: "Sở thích" }),
    ).toBeAttached();

    const scrollWidth = await page.evaluate(
      () => document.documentElement.scrollWidth,
    );

    expect(scrollWidth).toBeLessThanOrEqual(PHONE_WIDTH);
  });
});
