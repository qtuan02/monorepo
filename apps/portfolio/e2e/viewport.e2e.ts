import type { Locator, Page } from "@playwright/test";
import { expect, test } from "@playwright/test";

import { ROUTES } from "../src/constants/routes";

/**
 * The narrowest phone the CV is expected on. Contact and Hobbies used to sit in
 * two rigid flex columns, and the email address alone pushed the left one past
 * this width — a defect a jsdom test cannot see, because jsdom lays nothing out.
 */
const PHONE_WIDTH = 375;

/** The other width the ticket names, and where Projects goes three across. */
const TABLET_WIDTH = 768;

/**
 * `ux#67`: body copy is at least 15 px on a phone, meta at least 14 px.
 *
 * Pinned here rather than in jsdom because a Tailwind class only becomes a
 * pixel once a browser has resolved the stylesheet — `text-[15px]` and
 * `text-xs` are indistinguishable to a `className` assertion.
 *
 * This spec exists because the rule was checked by hand once and never written
 * down. The Projects section landed afterwards at `text-xs`, i.e. 12 px on a
 * phone, and nothing anywhere went red.
 */
const BODY_MIN_PX = 15;
const META_MIN_PX = 14;

async function fontSizeOf(element: Locator) {
  await expect(element).toBeAttached();

  const fontSize = await element.evaluate(
    (node) => getComputedStyle(node).fontSize,
  );

  return Number.parseFloat(fontSize);
}

/** The sections fade in, but they are in the DOM from the first paint. */
async function openHomeAt(page: Page, width: number, height: number) {
  await page.setViewportSize({ width, height });
  await page.goto(ROUTES.HOME);

  await expect(
    page.getByRole("heading", { level: 2, name: "Sở thích" }),
  ).toBeAttached();
}

test.describe("viewport", () => {
  for (const [label, width] of [
    ["375 px phone", PHONE_WIDTH],
    ["768 px tablet", TABLET_WIDTH],
  ] as const) {
    test(`never scrolls sideways on a ${label}`, async ({ page }) => {
      await openHomeAt(page, width, 900);

      const scrollWidth = await page.evaluate(
        () => document.documentElement.scrollWidth,
      );

      expect(scrollWidth).toBeLessThanOrEqual(width);
    });
  }

  test("sets body copy to at least 15 px on a phone", async ({ page }) => {
    await openHomeAt(page, PHONE_WIDTH, 800);

    // The prose a recruiter actually reads, in all three places it appears.
    // The first work role is open at rest, so its bullets are laid out.
    const about = page.locator("#about").getByRole("paragraph").first();
    const workBullet = page
      .locator('[data-slot="resume-card-body"]')
      .getByRole("listitem")
      .first();
    const projectDescription = page
      .locator('#projects [data-slot="card-description"]')
      .first();

    // The bullets and the tech-stack chips are both `li` inside the card, and
    // the chips are the ones carrying a badge. Excluding them is a decision,
    // not a convenience: a chip is a one-word token, not copy, and the same
    // 12 px chips sit in Skills — left there by this ticket's own typography
    // pass, which ran after that section landed. `ux#67` spells its meta floor
    // out as "(period, contact)", so chips are outside the rule by name.
    const projectBullet = page
      .locator("#projects")
      .getByRole("listitem")
      .filter({ hasNot: page.locator('[data-slot="badge"]') })
      .first();

    expect(await fontSizeOf(about), "About prose").toBeGreaterThanOrEqual(
      BODY_MIN_PX,
    );
    expect(await fontSizeOf(workBullet), "Work bullet").toBeGreaterThanOrEqual(
      BODY_MIN_PX,
    );
    expect(
      await fontSizeOf(projectDescription),
      "Project description",
    ).toBeGreaterThanOrEqual(BODY_MIN_PX);
    expect(
      await fontSizeOf(projectBullet),
      "Project bullet",
    ).toBeGreaterThanOrEqual(BODY_MIN_PX);
  });

  test("shows a folded row's chevron at rest on a phone, where there is no hover", async ({
    page,
  }) => {
    // A touch reader has no hover, so an affordance that only appears under
    // the cursor does not exist for them: the chevron used to sit at
    // `opacity-0` until hovered, and nothing went red. A `className` test
    // could only ask whether that utility is absent; this asks what a phone
    // sees. The second row is the folded one — the first opens at rest.
    await openHomeAt(page, PHONE_WIDTH, 800);

    const foldedRow = page
      .locator("#work")
      .getByRole("button", { name: "Xem chi tiết công việc" })
      .nth(1);

    await expect(foldedRow).toHaveAttribute("aria-expanded", "false");

    const chevron = foldedRow.locator("svg");

    await expect(chevron).toBeVisible();

    const opacity = await chevron.evaluate(
      (node) => getComputedStyle(node).opacity,
    );

    expect(Number.parseFloat(opacity)).toBeGreaterThan(0);
  });

  test("sets meta to at least 14 px on a phone", async ({ page }) => {
    await openHomeAt(page, PHONE_WIDTH, 800);

    // The supporting lines, which may be a step smaller than the prose but not
    // smaller than this. Both are labels on a control, so they are also the
    // smallest thing a reader is asked to hit.
    const contactLink = page.locator("#contact").getByRole("link").first();
    const projectLink = page.locator("#projects").getByRole("link").first();

    expect(await fontSizeOf(contactLink), "Contact").toBeGreaterThanOrEqual(
      META_MIN_PX,
    );
    expect(
      await fontSizeOf(projectLink),
      "Project link",
    ).toBeGreaterThanOrEqual(META_MIN_PX);
  });
});
