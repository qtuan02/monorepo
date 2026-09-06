import { expect, test } from "@playwright/test";

import { ROUTES } from "../src/constants/routes";

/**
 * Two behaviours a jsdom test structurally cannot see, because both are
 * decided by CSS the browser resolves and by what the *server* sent before any
 * JavaScript ran.
 *
 * Both had a real bug in them when this suite was written, and neither showed
 * up anywhere else: the page printed blank from the dark theme, and a reader
 * with reduced motion was served markup that starts at `opacity: 0`.
 */
test.describe("print", () => {
  test("prints as a CV: no chrome, every role open, black on white", async ({
    page,
  }) => {
    // In the dark theme on purpose. A browser does not print background
    // graphics unless the reader ticks a box, so a dark palette reaching the
    // print stylesheet means near-white text on white paper — a blank CV, and
    // the reader has no way to tell before it comes out of the printer.
    await page.addInitScript(() => {
      window.localStorage.setItem("theme", "dark");
    });
    await page.goto(ROUTES.HOME);
    await page.emulateMedia({ media: "print" });

    await expect(page.locator("#work")).toBeVisible();

    expect(
      await page.evaluate(
        () => getComputedStyle(document.body).backgroundColor,
      ),
    ).toBe("rgb(255, 255, 255)");

    // Every work row's body has height on paper: folded rows print open,
    // because there is nobody to click a chevron on a sheet of paper.
    const bodies = page.locator('[data-slot="resume-card-body"]');
    const count = await bodies.count();

    expect(count).toBeGreaterThan(0);

    for (let index = 0; index < count; index += 1) {
      const box = await bodies.nth(index).boundingBox();

      expect(box?.height ?? 0, `body ${index}`).toBeGreaterThan(20);
    }

    // The dock is the app's whole screen chrome and means nothing on paper.
    await expect(page.locator('[data-slot="tooltip-provider"]')).toBeHidden();
  });
});

test.describe("prefers-reduced-motion", () => {
  test("shows the page at rest, before any JavaScript has run", async ({
    browser,
  }) => {
    const context = await browser.newContext({ reducedMotion: "reduce" });
    const page = await context.newPage();

    await page.goto(ROUTES.HOME);

    // Read immediately: the guarantee has to hold on the bytes the server
    // sent. `BlurFade` reads the preference in JavaScript too, but that answer
    // arrives only after hydration — and the markup it hydrates carries
    // motion's `opacity: 0`, so CSS is what makes the page visible meanwhile.
    const opacity = await page
      .locator('[data-slot="blur-fade"]')
      .first()
      .evaluate((element) => getComputedStyle(element).opacity);

    expect(Number.parseFloat(opacity)).toBe(1);

    const waveAnimation = await page
      .getByText("👋")
      .evaluate((element) => getComputedStyle(element).animationName);

    expect(waveAnimation).toBe("none");

    await context.close();
  });
});
