import { expect, test } from "@playwright/test";

import { ROUTES } from "../src/constants/routes";

/**
 * Behaviours a jsdom test structurally cannot see, because each is decided by
 * CSS the browser resolves or by what the *server* sent before any JavaScript
 * ran.
 *
 * Two of them had a real bug in them when this suite was written, and neither
 * showed up anywhere else: the page printed blank from the dark theme, and a
 * reader with reduced motion was served markup that starts at `opacity: 0`.
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

  test("prints an external link with the URL it points at", async ({
    page,
  }) => {
    await page.goto(ROUTES.HOME);
    await page.emulateMedia({ media: "print" });

    // A printed link is a dead end unless the paper says where it goes, and the
    // project cards are the only external links in the body of the CV. Reading
    // the computed `content` resolves `attr(href)` to the real string, so this
    // asserts what would be inked rather than the rule that produces it.
    const projectLink = page.locator("#projects").getByRole("link").first();

    await expect(projectLink).toBeAttached();

    const href = await projectLink.getAttribute("href");
    const printed = await projectLink.evaluate(
      (node) => getComputedStyle(node, "::after").content,
    );

    expect(href).toBeTruthy();
    expect(printed).toContain(href ?? "");
  });

  test("leaves a contact link alone, whose text is already the URL", async ({
    page,
  }) => {
    await page.goto(ROUTES.HOME);
    await page.emulateMedia({ media: "print" });

    // `href^="http"` rather than the first link in the section: the first two
    // contact lines are `mailto:` and `tel:`, which the print rule never
    // matched in the first place. Asserting on one of those would pass with
    // `:not(#contact a)` deleted from the stylesheet — a test with no teeth.
    // The selector mirrors the rule it pins, which is why it names the
    // attribute the rule keys on.
    const contactLink = page.locator('#contact a[href^="http"]').first();

    await expect(contactLink).toBeAttached();

    const printed = await contactLink.evaluate(
      (node) => getComputedStyle(node, "::after").content,
    );

    expect(printed).toBe("none");
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
