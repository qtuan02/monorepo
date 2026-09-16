import { expect, test } from "@playwright/test";

import { ROUTES } from "../src/constants/routes";

/**
 * Behaviours a jsdom test structurally cannot see, because each is decided by
 * CSS the browser resolves or by what the *server* sent before any JavaScript
 * ran.
 *
 * One of them had a real bug in it when this suite was written, and it showed
 * up nowhere else: the page printed blank from the dark theme.
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
    // Located as a bare `nav`, attached first: `getByRole` skips a hidden
    // element, and `toBeHidden()` on a locator that matches nothing passes —
    // which is how v1's assertion on `[data-slot="tooltip-provider"]`, an
    // element Base UI's provider never renders, held for a whole release.
    const dock = page.locator("nav");

    await expect(dock).toBeAttached();
    await expect(dock).toBeHidden();
  });

  test("prints every block flat: no shadow, a 1px edge, no window chrome", async ({
    page,
  }) => {
    await page.goto(ROUTES.HOME);
    await page.emulateMedia({ media: "print" });

    await expect(page.locator("#work")).toBeVisible();

    // Every block the page is built from — the eleven standard blocks after
    // the hero and the hero's own terminal window — casts a solid 4px shadow
    // and draws a 2px edge on screen. On paper the shadow is ink spent on
    // nothing and a 2px rule is a box drawn around every paragraph, so the
    // print branch drops the one and thins the other. The count is part of
    // the claim: a block that stopped carrying its slot would leave the print
    // rule with nothing to match, and still pass a `for … of` over zero.
    const blocks = page.locator(
      '[data-slot="standard-block"], [data-slot="terminal-window"]',
    );

    await expect(blocks).toHaveCount(12);

    for (const block of await blocks.all()) {
      await expect(block).toHaveCSS("box-shadow", "none");
      await expect(block).toHaveCSS("border-top-width", "1px");
    }

    // The window's title bar is the screen's metaphor, not the CV's content:
    // attached — the markup is the same document — but not laid out.
    const titleBar = page.locator('[data-slot="terminal-title-bar"]');

    await expect(titleBar).toBeAttached();
    await expect(titleBar).toBeHidden();
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
  test("has nothing left to switch off at rest", async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: "reduce" });
    const page = await context.newPage();

    await page.goto(ROUTES.HOME);
    await expect(page.locator("#work")).toBeVisible();
    // The language select hydrates behind a `Suspense` whose fallback is a
    // pulsing `Skeleton`, and `#work` is visible before that resolves. A
    // loading placeholder is not an entrance animation, so it is waited out
    // rather than counted — read while it still pulsed, the list below has
    // one `pulse` in it, and whether that happens is a hydration race.
    await expect(page.locator('[data-slot="skeleton"]')).toHaveCount(0);

    // The sections arrive at rest and the hero no longer waves, so under the
    // preference — and, since v2, without it — nothing on the page is
    // animating once it has loaded. The one animation the preference still
    // switches off is the theme wipe, which only exists inside a view
    // transition and so has no computed style to read here; what this pins is
    // that no new entrance animation has crept back in.
    const running = await page.evaluate(() =>
      document.getAnimations().map((animation) => animation.id || "animation"),
    );

    expect(running).toEqual([]);

    await context.close();
  });
});
