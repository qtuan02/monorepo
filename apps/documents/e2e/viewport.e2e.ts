import type { Page } from "@playwright/test";
import { expect, test } from "@playwright/test";

import { ROUTES } from "../src/constants/routes";

/**
 * One E2E file for every responsive assertion in the round (spec #215):
 * each ticket in the ①→②→③ chain adds its own `describe` here rather than a
 * sibling file, so a viewport regression always shows up in one place.
 */

/** The landing page's one h1 — same string `documents.e2e.ts` asserts on. */
const LANDING_HEADLINE = "Primitive Base UI, mỗi import một file.";

/**
 * The three pages the brief measured `scrollWidth` on (§1, points 1–2): the
 * landing page (three numbered `DocsSection` panels), a catalogue list, and a
 * detail page — the one page whose hero + `DetailExample` iframe is the
 * tallest DOM in the site.
 */
const PAGES = [
  { path: ROUTES.HOME, heading: LANDING_HEADLINE },
  { path: ROUTES.COMPONENTS, heading: "Component" },
  { path: ROUTES.componentBySlugPath("dialog"), heading: "dialog" },
] as const;

/** 320/375/414 cover phone, 768 is the tablet this ticket fixes, 1024 must stay unchanged. */
const SCROLL_WIDTHS = [320, 375, 414, 768, 1024];

async function gotoAndWaitForHeading(
  page: Page,
  width: number,
  path: string,
  heading: string,
) {
  await page.setViewportSize({ width, height: 1024 });
  await page.goto(path);
  await expect(
    page.getByRole("heading", { level: 1, name: heading }),
  ).toBeVisible();
}

test.describe("viewport", () => {
  // (a) — red before the fix at 768 (scrollWidth 815 on every page), green after.
  test.describe("never scrolls sideways", () => {
    for (const width of SCROLL_WIDTHS) {
      for (const { path, heading } of PAGES) {
        test(`at ${width}px on ${path}`, async ({ page }) => {
          await gotoAndWaitForHeading(page, width, path, heading);

          const scrollWidth = await page.evaluate(
            () => document.documentElement.scrollWidth,
          );

          expect(scrollWidth).toBeLessThanOrEqual(width);
        });
      }
    }
  });

  // (b) — the nav pill itself: inside the viewport and one line (≤ 60px tall)
  // at 768, in both locales — English is the longer label set ("Getting
  // started" vs "Bắt đầu"), so it is the one that would go red first.
  for (const locale of ["vi-VN", "en-US"] as const) {
    test.describe(`nav pill fits one line at 768px (${locale})`, () => {
      test.use({ locale });

      test("stays inside the viewport and under 60px tall", async ({
        page,
      }) => {
        await page.setViewportSize({ width: 768, height: 1024 });
        await page.goto(ROUTES.HOME);

        const nav = page.getByRole("navigation");
        await expect(nav).toBeVisible();

        const box = await nav.boundingBox();
        if (!box) throw new Error("the nav pill has no box");

        expect(box.x).toBeGreaterThanOrEqual(0);
        expect(box.x + box.width).toBeLessThanOrEqual(768);
        expect(box.height).toBeLessThanOrEqual(60);
      });
    });
  }

  // Cheap follow-on from (a): the `DocsSection` panel is one column at 768,
  // so none of the five Getting Started snippets should need to scroll
  // inside their own `<pre>` any more (contrast phone, where the single long
  // `@import` line scrolling in place is deliberate — §1 of the brief).
  test("none of the Getting Started snippets scroll inside their own <pre> at 768px", async ({
    page,
  }) => {
    await gotoAndWaitForHeading(page, 768, ROUTES.HOME, LANDING_HEADLINE);

    const overflowing = await page
      .locator("pre")
      .evaluateAll((nodes) =>
        nodes
          .filter((node) => node.scrollWidth > node.clientWidth)
          .map((node) => node.textContent),
      );

    expect(overflowing).toEqual([]);
  });

  // The other acceptance-criteria measurement with no E2E coverage yet: the
  // three count cards go two-up at 768, Storybook spanning both, and the
  // narrower (Hook) card still clears the 340px floor. The card's accessible
  // name leads with the count ("Hook 18 hook dùng chung"), which is what
  // tells it apart from the plain "Hook" nav link and the guide's "Xem danh
  // sách hook" link — both also point at `/hooks`.
  test("sizes the Hook card at least 340px wide at 768px, with Storybook spanning both columns", async ({
    page,
  }) => {
    await gotoAndWaitForHeading(page, 768, ROUTES.HOME, LANDING_HEADLINE);

    const hookCard = page.getByRole("link", { name: /^Hook \d/ });
    const storybookCard = page.locator('main a[target="_blank"]');

    const [hookBox, storybookBox] = await Promise.all([
      hookCard.boundingBox(),
      storybookCard.boundingBox(),
    ]);
    if (!hookBox || !storybookBox) throw new Error("a count card has no box");

    expect(hookBox.width).toBeGreaterThanOrEqual(340);
    // Spans both columns: noticeably wider than the single narrower card
    // rather than merely "wider than", so a regression back to one column
    // (same width as the Hook card) fails this too.
    expect(storybookBox.width).toBeGreaterThan(hookBox.width * 1.5);
  });

  // (c) — #219: below `sm` a Tile is a row, not a column. The first tile on
  // `/components` stays under 80px tall, and its swatch sits on the same
  // line as the slug rather than stacked above it.
  test.describe("a tile is a row at 375px", () => {
    test("the first tile on /components is short, with the swatch beside the slug", async ({
      page,
    }) => {
      await gotoAndWaitForHeading(page, 375, ROUTES.COMPONENTS, "Component");

      const firstTile = page.getByRole("listitem").first();
      const swatch = firstTile.getByTestId("swatch");
      const slug = firstTile.getByTestId("tile-slug");

      const [tileBox, swatchBox, slugBox] = await Promise.all([
        firstTile.boundingBox(),
        swatch.boundingBox(),
        slug.boundingBox(),
      ]);
      if (!tileBox || !swatchBox || !slugBox) {
        throw new Error("the first tile, its swatch or its slug has no box");
      }

      expect(tileBox.height).toBeLessThan(80);
      expect(Math.abs(swatchBox.y - slugBox.y)).toBeLessThanOrEqual(4);
    });

    // The hook page's longest slug ("use-isomorphic-layout-effect") is the
    // one the brief measured — it must stay one line, and the sentence under
    // it clamps to two, so a long description can never blow the row height.
    test("the use-isomorphic-layout-effect row on /hooks keeps its slug on one line and its description to two", async ({
      page,
    }) => {
      await gotoAndWaitForHeading(page, 375, ROUTES.HOOKS, "Hook");

      const row = page
        .getByRole("listitem")
        .filter({ hasText: "use-isomorphic-layout-effect" });
      const slug = row.getByTestId("tile-slug");
      const description = row.getByTestId("tile-description");

      const [slugBox, descriptionBox] = await Promise.all([
        slug.boundingBox(),
        description.boundingBox(),
      ]);
      if (!slugBox || !descriptionBox) {
        throw new Error("the use-isomorphic-layout-effect row has no box");
      }

      // One line of 14px mono text is ~20px tall; two lines of the 14px
      // description sentence is ~40px — three would push past 48.
      expect(slugBox.height).toBeLessThanOrEqual(24);
      expect(descriptionBox.height).toBeLessThanOrEqual(48);
    });
  });

  // (d) — #219: the tablet grid is three columns at 768px on both catalogues.
  test.describe("the catalogue grid is three columns at 768px", () => {
    const CATALOGUE_PAGES = [
      { path: ROUTES.COMPONENTS, heading: "Component" },
      { path: ROUTES.HOOKS, heading: "Hook" },
    ] as const;

    for (const { path, heading } of CATALOGUE_PAGES) {
      test(`on ${path}`, async ({ page }) => {
        await gotoAndWaitForHeading(page, 768, path, heading);

        const tiles = page.getByRole("listitem");
        const [firstBox, secondBox, thirdBox, fourthBox] = await Promise.all([
          tiles.nth(0).boundingBox(),
          tiles.nth(1).boundingBox(),
          tiles.nth(2).boundingBox(),
          tiles.nth(3).boundingBox(),
        ]);
        if (!firstBox || !secondBox || !thirdBox || !fourthBox) {
          throw new Error("one of the first four tiles has no box");
        }

        expect(Math.abs(secondBox.y - firstBox.y)).toBeLessThanOrEqual(4);
        expect(Math.abs(thirdBox.y - firstBox.y)).toBeLessThanOrEqual(4);
        expect(fourthBox.y).toBeGreaterThan(firstBox.y + firstBox.height / 2);
      });
    }
  });
});
