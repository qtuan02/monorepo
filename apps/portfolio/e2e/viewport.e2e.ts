import type { Locator, Page } from "@playwright/test";
import { expect, test } from "@playwright/test";

import { ROUTES } from "../src/constants/routes";

/**
 * The narrowest phone the CV is expected on. Contact and Hobbies used to sit in
 * two rigid flex columns, and the email address alone pushed the left one past
 * this width — a defect a jsdom test cannot see, because jsdom lays nothing out.
 */
const PHONE_WIDTH = 375;

/** The other width the ticket names; still one column, Projects two across. */
const TABLET_WIDTH = 768;

/**
 * A desktop, where the page becomes two columns (#123): About, Work and
 * Projects in a 2/3 column, the reference sections in a 1/3 rail beside them.
 * Measured rather than trusted because the split is three Tailwind variants
 * across two files, and a `lg:` typo leaves the rail under the column with
 * nothing red anywhere.
 */
const DESKTOP_WIDTH = 1440;

/**
 * `ux#67`: body copy is at least 15 px on a phone, meta at least 14 px.
 *
 * Pinned here rather than in jsdom because a Tailwind class only becomes a
 * pixel once a browser has resolved the stylesheet — `text-body` (15px) and
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

/** The home page at a given viewport, once its last section is in the DOM. */
async function openHomeAt(page: Page, width: number, height: number) {
  await page.setViewportSize({ width, height });
  await page.goto(ROUTES.HOME);

  await expect(
    page.getByRole("heading", { level: 2, name: "Sở thích" }),
  ).toBeAttached();
}

test.describe("viewport", () => {
  test("puts the rail beside the column on a desktop, and under it on a phone", async ({
    page,
  }) => {
    await openHomeAt(page, DESKTOP_WIDTH, 900);

    const about = page.locator("#about");
    const skills = page.locator("#skills");
    const hero = page.locator("#hero");
    const main = page.getByRole("main");

    const [aboutBox, skillsBox, heroBox, mainBox] = await Promise.all([
      about.boundingBox(),
      skills.boundingBox(),
      hero.boundingBox(),
      main.boundingBox(),
    ]);

    expect(aboutBox).not.toBeNull();
    expect(skillsBox).not.toBeNull();
    expect(heroBox).not.toBeNull();
    expect(mainBox).not.toBeNull();

    if (!aboutBox || !skillsBox || !heroBox || !mainBox) return;

    // The rail starts to the right of the column and on the same row as it.
    expect(skillsBox.x).toBeGreaterThan(aboutBox.x + aboutBox.width);
    expect(Math.abs(skillsBox.y - aboutBox.y)).toBeLessThan(2);
    // The column is the wider track — about twice the rail.
    expect(aboutBox.width / skillsBox.width).toBeGreaterThan(1.8);
    expect(aboutBox.width / skillsBox.width).toBeLessThan(2.2);
    // The hero spans both tracks: as wide as the well, minus its padding.
    expect(heroBox.width).toBeGreaterThan(aboutBox.width + skillsBox.width);
    expect(heroBox.width).toBeLessThanOrEqual(mainBox.width);

    // The projects are one block in the column, as wide as About: three
    // rows, not three cards (#125).
    const projects = page.locator('#projects [data-slot="standard-block"]');
    await expect(projects).toHaveCount(1);
    const projectsBox = await projects.boundingBox();
    if (!projectsBox) throw new Error("the projects block has no box");
    expect(Math.abs(projectsBox.width - aboutBox.width)).toBeLessThan(2);

    // And one column again on a phone: the rail sits under the column.
    await openHomeAt(page, PHONE_WIDTH, 812);
    const [aboutPhone, skillsPhone] = await Promise.all([
      about.boundingBox(),
      skills.boundingBox(),
    ]);
    if (!aboutPhone || !skillsPhone) throw new Error("a section has no box");
    expect(skillsPhone.y).toBeGreaterThan(aboutPhone.y + aboutPhone.height);
    expect(Math.abs(skillsPhone.x - aboutPhone.x)).toBeLessThan(2);
  });

  test("keeps the 2/1 desktop ratio exactly from the lg breakpoint (1024)", async ({
    page,
  }) => {
    await openHomeAt(page, 1024, 900);

    const about = page.locator("#about");
    const aside = page.locator("aside");
    const [aboutBox, asideBox] = await Promise.all([
      about.boundingBox(),
      aside.boundingBox(),
    ]);
    if (!aboutBox || !asideBox) throw new Error("a section has no box");

    expect(asideBox.x).toBeGreaterThan(aboutBox.x + aboutBox.width);
    expect(aboutBox.width / asideBox.width).toBeGreaterThan(1.8);
    expect(aboutBox.width / asideBox.width).toBeLessThan(2.2);
  });

  test("splits the tablet into a 3/2 column pair, with a sticky rail, at 768", async ({
    page,
  }) => {
    await openHomeAt(page, TABLET_WIDTH, 900);

    const about = page.locator("#about");
    const aside = page.locator("aside");
    const [aboutBox, asideBox] = await Promise.all([
      about.boundingBox(),
      aside.boundingBox(),
    ]);
    if (!aboutBox || !asideBox) throw new Error("a section has no box");

    // The rail sits beside the read column, not under it — the same shape as
    // `lg`, just a narrower rail (~264 px of a 768 px well).
    expect(asideBox.x).toBeGreaterThanOrEqual(aboutBox.x + aboutBox.width);
    expect(asideBox.width).toBeGreaterThanOrEqual(240);
    expect(asideBox.width).toBeLessThanOrEqual(290);

    // The rail keeps up with the scroll instead of scrolling off with the
    // column — `md:sticky`, not just `md:grid-cols-[...]`.
    await page.mouse.wheel(0, 800);
    const asideAfterScroll = await aside.boundingBox();
    if (!asideAfterScroll) throw new Error("the rail lost its box");
    expect(asideAfterScroll.y).toBeGreaterThanOrEqual(0);
  });

  test("stacks Skills' label over its list, and Hobbies under Contact, at 768", async ({
    page,
  }) => {
    await openHomeAt(page, TABLET_WIDTH, 900);

    // Rail width at 768 is too narrow for a fixed label gutter beside a list.
    const firstGroupHeading = page.locator("#skills h3").first();
    const firstGroupList = page.locator("#skills ul").first();
    const [headingBox, listBox] = await Promise.all([
      firstGroupHeading.boundingBox(),
      firstGroupList.boundingBox(),
    ]);
    if (!headingBox || !listBox) throw new Error("a skills row has no box");
    expect(listBox.y).toBeGreaterThan(headingBox.y);

    const contact = page.locator("#contact");
    const hobbies = page.locator("#hobbies");
    const [contactBox, hobbiesBox] = await Promise.all([
      contact.boundingBox(),
      hobbies.boundingBox(),
    ]);
    if (!contactBox || !hobbiesBox) throw new Error("a section has no box");
    expect(hobbiesBox.y).toBeGreaterThanOrEqual(
      contactBox.y + contactBox.height,
    );
  });

  test("keeps Contact and Hobbies side by side at 640 px (sm), below md", async ({
    page,
  }) => {
    await openHomeAt(page, 640, 900);

    const contact = page.locator("#contact");
    const hobbies = page.locator("#hobbies");
    const [contactBox, hobbiesBox] = await Promise.all([
      contact.boundingBox(),
      hobbies.boundingBox(),
    ]);
    if (!contactBox || !hobbiesBox) throw new Error("a section has no box");

    expect(Math.abs(hobbiesBox.y - contactBox.y)).toBeLessThan(2);
    expect(hobbiesBox.x).toBeGreaterThan(contactBox.x + contactBox.width - 2);
  });

  test("gives landscape phone the base top padding, and 768+ the full 96 px", async ({
    page,
  }) => {
    // 667×375 is below `md`, so `main` keeps its base `py-12` (48 px) rather
    // than the 96 px `pt-24` reserved for a viewport tall enough to afford it.
    await page.setViewportSize({ width: 667, height: 375 });
    await page.goto(ROUTES.HOME);
    await expect(
      page.getByRole("heading", { level: 2, name: "Sở thích" }),
    ).toBeAttached();

    const landscapePaddingTop = await page
      .getByRole("main")
      .evaluate((node) => getComputedStyle(node).paddingTop);
    expect(Number.parseFloat(landscapePaddingTop)).toBe(48);

    await openHomeAt(page, TABLET_WIDTH, 900);
    const tabletPaddingTop = await page
      .getByRole("main")
      .evaluate((node) => getComputedStyle(node).paddingTop);
    expect(Number.parseFloat(tabletPaddingTop)).toBe(96);
  });

  test("reserves scroll padding so a focused contact link clears the dock", async ({
    page,
  }) => {
    await openHomeAt(page, PHONE_WIDTH, 812);

    const scrollPaddingBottom = await page.evaluate(
      () => getComputedStyle(document.documentElement).scrollPaddingBottom,
    );
    expect(Number.parseFloat(scrollPaddingBottom)).toBeCloseTo(96, 0);

    const lastContactLink = page.locator("#contact").getByRole("link").last();
    await lastContactLink.focus();

    const box = await lastContactLink.boundingBox();
    if (!box) throw new Error("the last contact link has no box");
    // The dock is fixed at the bottom; ~68 px is its own reserve (see
    // `~/globals.css`'s comment on `scroll-padding-bottom`).
    expect(box.y + box.height).toBeLessThanOrEqual(812 - 68);
  });

  // 320 and 414 join the set from the 320 px commitment (#210 §8 Q6) — 320 is
  // the narrowest phone anyone reads this on, 414 the widest common one.
  for (const [label, width] of [
    ["320 px phone", 320],
    ["375 px phone", PHONE_WIDTH],
    ["414 px phone", 414],
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

  test("never scrolls sideways on a 375 px phone in English either", async ({
    page,
  }) => {
    // The other locale is the one with the longer labels: an English period
    // ("Mar 2025 – Feb 2026") is wider than its Vietnamese counterpart, and it
    // is set in monospace with `whitespace-nowrap`, so if a work row is ever
    // going to push past the viewport, this is where. The literal `/en` is
    // the URL a visitor types — the exception `testing-playwright` names.
    await page.setViewportSize({ width: PHONE_WIDTH, height: 900 });
    await page.goto("/en");

    await expect(
      page.getByRole("heading", { level: 2, name: "Hobbies" }),
    ).toBeAttached();

    const scrollWidth = await page.evaluate(
      () => document.documentElement.scrollWidth,
    );

    expect(scrollWidth).toBeLessThanOrEqual(PHONE_WIDTH);
  });

  // 320, 414 and 768 join the English case too — same 320 px commitment, the
  // other locale. A sibling test above already covers 375 in English.
  for (const [label, width] of [
    ["320 px phone", 320],
    ["414 px phone", 414],
    ["768 px tablet", TABLET_WIDTH],
  ] as const) {
    test(`never scrolls sideways on a ${label} in English`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/en");

      await expect(
        page.getByRole("heading", { level: 2, name: "Hobbies" }),
      ).toBeAttached();

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
    // The block's first paragraph is the note; a row's first is its pitch.
    const projectDescription = page
      .locator('#projects [data-slot="standard-block"] li')
      .first()
      .getByRole("paragraph")
      .first();

    // The bullets and the tech-stack chips are both `li` inside the card, and
    // the chips are the ones carrying a badge. Excluding them is a decision,
    // not a convenience: a chip is a one-word token, not copy. `ux#67` spells
    // its meta floor out as "(period, contact)", so chips are outside the rule
    // by name. (Skills used to carry the same 12 px chips; since #118 it is
    // text, and the meta test below holds it to 14 px.)
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
    // The two monospace labels #118 added: a contact field name, and a skill
    // in the directory listing — both were the place 12 px would come back.
    const contactLabel = page.locator("#contact").getByText("Email", {
      exact: true,
    });
    const skill = page.locator("#skills").getByRole("listitem").first();

    expect(await fontSizeOf(contactLink), "Contact").toBeGreaterThanOrEqual(
      META_MIN_PX,
    );
    expect(
      await fontSizeOf(projectLink),
      "Project link",
    ).toBeGreaterThanOrEqual(META_MIN_PX);
    expect(
      await fontSizeOf(contactLabel),
      "Contact label",
    ).toBeGreaterThanOrEqual(META_MIN_PX);
    expect(await fontSizeOf(skill), "Skill").toBeGreaterThanOrEqual(
      META_MIN_PX,
    );
  });
});
