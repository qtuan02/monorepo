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

    // The projects are two blocks in the column, each as wide as About: one
    // per project (#269), not the three shared rows #125 first drew.
    const projects = page.locator('#projects [data-slot="standard-block"]');
    await expect(projects).toHaveCount(2);
    const projectsBox = await projects.first().boundingBox();
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

  test("splits the tablet into a 3/2 column pair, with a rail that scrolls with the page, at 768", async ({
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

    // The rail is no longer `md:sticky` (#270) — it is taller than a laptop
    // viewport, so pinning it kept Contact/Hobbies off-screen until the read
    // column had scrolled past. It now moves with the scroll by exactly the
    // scrolled distance, the same as any other in-flow element.
    const scrollYBefore = await page.evaluate(() => window.scrollY);
    // `scrollBy` rather than a simulated wheel: a wheel event routes through
    // whatever element is under the (unmoved) mouse cursor, which is flaky
    // under load — this only needs the page to actually scroll.
    await page.evaluate(() => window.scrollBy(0, 800));
    const [scrollYAfter, asideAfterScroll] = await Promise.all([
      page.evaluate(() => window.scrollY),
      aside.boundingBox(),
    ]);
    if (!asideAfterScroll) throw new Error("the rail lost its box");
    const scrolled = scrollYAfter - scrollYBefore;
    expect(scrolled).toBeGreaterThan(200);
    expect(asideBox.y - asideAfterScroll.y).toBeCloseTo(scrolled, 0);
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

  // #270: the label used to sit in a fixed `sm:w-24` gutter, which left the
  // 36-character LinkedIn value nowhere to go but its own row — one row was
  // roughly twice the height of the other five, at every desktop width. The
  // label is `sr-only` now, so every row is just an icon and a value.
  for (const width of [1024, 1440]) {
    test(`keeps every Contact row to one line of text at ${width}`, async ({
      page,
    }) => {
      await openHomeAt(page, width, 900);

      const rows = page.locator('#contact [data-slot="standard-block"] > div');
      const rowCount = await rows.count();
      expect(rowCount).toBeGreaterThan(0);

      const boxes = await Promise.all(
        Array.from({ length: rowCount }, (_, index) =>
          rows.nth(index).boundingBox(),
        ),
      );
      const heights = boxes.map((box) => {
        if (!box) throw new Error("a contact row has no box");
        return box.height;
      });

      // The row's value carries `text-sm`'s line-height — a genuine
      // single-line row can never exceed it by more than a few px of
      // rounding. Anchored to the CSS line-height itself, not to the other
      // rows' heights, so a translation change that happened to wrap every
      // row the same amount couldn't slip past this the way a row-to-row
      // comparison could.
      const lineHeight = await rows
        .first()
        .locator("> :last-child")
        .evaluate((el) => Number.parseFloat(getComputedStyle(el).lineHeight));

      for (const height of heights) {
        expect(height).toBeLessThanOrEqual(lineHeight + 4);
      }
    });
  }

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
    // Each project is its own block now (#269); a block's first paragraph is
    // its description — there is no separate bullet to check, since a project
    // card has never had one (#125).
    const projectDescription = page
      .locator('#projects [data-slot="standard-block"]')
      .first()
      .getByRole("paragraph")
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

  // The 320 px commitment (#210 §8 Q6): the dock's `position: fixed` never
  // contributed to `scrollWidth`, so the "never scrolls sideways" specs above
  // stayed green while the bar itself sat 14 px off each edge at 375 px
  // (#211). This measures the bar's own box against the viewport instead.
  for (const width of [320, PHONE_WIDTH, 414]) {
    test(`keeps the dock inside the viewport at ${width} px`, async ({
      page,
    }) => {
      await openHomeAt(page, width, 800);

      const nav = page.getByRole("navigation");
      const box = await nav.boundingBox();
      if (!box) throw new Error("the dock has no box");

      expect(box.x).toBeGreaterThanOrEqual(0);
      expect(box.x + box.width).toBeLessThanOrEqual(width);
      // Below `sm` the dock is a full-width bar (Thanh chạm đáy) rather than
      // a centred pill, so at 375 it spans the viewport exactly.
      if (width === PHONE_WIDTH) expect(box.width).toBe(width);
    });
  }

  // #212: the hero's own grid, the MedViet row's grid, and the two inline
  // link hit-areas — the three points that used to be a `flex` row ceding a
  // third of a 375 px viewport to the avatar or a work-row logo.

  test("gives the hero's positioning line the full column on a phone, with the avatar only beside the name", async ({
    page,
  }) => {
    await openHomeAt(page, PHONE_WIDTH, 900);

    const heading = page.locator("#hero").getByRole("heading", { level: 1 });
    // The name row: `$ whoami` and the `h1` stacked in one grid cell — the
    // element the avatar's own row actually aligns against (`align-self:
    // start` on the avatar, per the mockup), not the `h1` alone.
    const nameGroup = heading.locator("xpath=..");
    // `getByRole("paragraph")` skips the two decorative `$ whoami`/`$ cat
    // role.txt` command lines on its own — `aria-hidden` removes them from
    // the accessibility tree, so a role query never sees them.
    const positioning = page.locator("#hero").getByRole("paragraph").first();
    const avatar = page.locator('#hero [data-slot="avatar"]');

    const [headingBox, nameGroupBox, positioningBox, avatarBox] =
      await Promise.all([
        heading.boundingBox(),
        nameGroup.boundingBox(),
        positioning.boundingBox(),
        avatar.boundingBox(),
      ]);
    if (!headingBox || !nameGroupBox || !positioningBox || !avatarBox) {
      throw new Error("the hero is missing a box");
    }

    // Positioning runs the full column now that it isn't sharing a row with
    // the avatar (`col-span-2` from this row down) — well past the 183 px
    // it was squeezed to before, and close to the block's ~283 px content
    // width at this viewport.
    expect(positioningBox.width).toBeGreaterThanOrEqual(250);
    expect(avatarBox.width).toBeCloseTo(80, 0);
    // Still on the name row rather than dropped below the whole card.
    expect(Math.abs(avatarBox.y - nameGroupBox.y)).toBeLessThanOrEqual(8);
    // The name's own row stays narrower than positioning's, because the
    // avatar shares it — that row is the one exception, by design
    // (`docs/design/portfolio-responsive/mockup-phone.html`, `.top`).
    expect(headingBox.width).toBeLessThan(positioningBox.width);
  });

  test("lays the hero's four actions out as a 2×2 grid on a phone, and one row from sm", async ({
    page,
  }) => {
    await openHomeAt(page, PHONE_WIDTH, 900);

    // The three `<a>` actions (email, GitHub, LinkedIn) plus the print
    // `<button>` — nothing else under `#hero` carries either role.
    const actions = page
      .locator("#hero")
      .getByRole("link")
      .or(page.locator("#hero").getByRole("button"));
    await expect(actions).toHaveCount(4);
    const email = actions.nth(0);
    const github = actions.nth(1);
    const linkedin = actions.nth(2);
    const print = actions.nth(3);

    const [emailBox, githubBox, linkedinBox, printBox] = await Promise.all([
      email.boundingBox(),
      github.boundingBox(),
      linkedin.boundingBox(),
      print.boundingBox(),
    ]);
    if (!emailBox || !githubBox || !linkedinBox || !printBox) {
      throw new Error("a hero action has no box");
    }

    const phoneBoxes = [emailBox, githubBox, linkedinBox, printBox];
    for (const box of phoneBoxes) {
      expect(box.height).toBeGreaterThanOrEqual(40);
    }
    // Two rows of two: the first pair shares a `y`, the second a lower one.
    expect(Math.abs(emailBox.y - githubBox.y)).toBeLessThan(2);
    expect(Math.abs(linkedinBox.y - printBox.y)).toBeLessThan(2);
    expect(linkedinBox.y).toBeGreaterThan(emailBox.y);
    // All four share the same two equal-width grid columns.
    const widths = phoneBoxes.map((box) => box.width);
    expect(Math.max(...widths) - Math.min(...widths)).toBeLessThanOrEqual(2);

    await openHomeAt(page, TABLET_WIDTH, 900);
    const [tabletEmailBox, , , tabletPrintBox] = await Promise.all([
      email.boundingBox(),
      github.boundingBox(),
      linkedin.boundingBox(),
      print.boundingBox(),
    ]);
    if (!tabletEmailBox || !tabletPrintBox) {
      throw new Error("a hero action has no box");
    }

    expect(tabletEmailBox.height).toBeCloseTo(32, 0);
    expect(tabletPrintBox.height).toBeCloseTo(32, 0);
    // One row: the first and the last action share a `y`.
    expect(Math.abs(tabletPrintBox.y - tabletEmailBox.y)).toBeLessThan(2);
  });

  test("runs the MedViet row's body under its logo on a phone, and beside it from sm", async ({
    page,
  }) => {
    await openHomeAt(page, PHONE_WIDTH, 900);

    // MedViet is `WORK_ITEMS[0]`, the only row expanded at rest.
    const logo = page
      .locator('#work [data-slot="standard-block"]')
      .first()
      .locator("img");
    const body = page
      .locator('#work [data-slot="resume-card-body"]')
      .first()
      .locator("ul");

    const [logoBoxPhone, bodyBoxPhone] = await Promise.all([
      logo.boundingBox(),
      body.boundingBox(),
    ]);
    if (!logoBoxPhone || !bodyBoxPhone) throw new Error("the row has no box");
    // The body runs the full row under the logo, not squeezed beside it.
    expect(Math.abs(bodyBoxPhone.x - logoBoxPhone.x)).toBeLessThanOrEqual(2);

    await openHomeAt(page, TABLET_WIDTH, 900);
    const [logoBoxTablet, bodyBoxTablet] = await Promise.all([
      logo.boundingBox(),
      body.boundingBox(),
    ]);
    if (!logoBoxTablet || !bodyBoxTablet) {
      throw new Error("the row has no box");
    }
    // Back beside the logo, as it was before this ticket.
    expect(bodyBoxTablet.x).toBeGreaterThan(
      logoBoxTablet.x + logoBoxTablet.width,
    );
  });

  test("gives the first project link and the contact email a 24 px tap target on a phone", async ({
    page,
  }) => {
    await openHomeAt(page, PHONE_WIDTH, 900);

    const projectLink = page.locator("#projects").getByRole("link").first();
    const contactEmailLink = page
      .locator("#contact")
      .getByRole("link")
      .filter({ hasText: "@" });

    const [projectBox, contactBox] = await Promise.all([
      projectLink.boundingBox(),
      contactEmailLink.boundingBox(),
    ]);
    if (!projectBox || !contactBox) throw new Error("a link has no box");

    expect(projectBox.height).toBeGreaterThanOrEqual(24);
    expect(contactBox.height).toBeGreaterThanOrEqual(24);
  });

  test("keeps at least 8 px between the project links when they wrap to a second line", async ({
    page,
  }) => {
    await openHomeAt(page, PHONE_WIDTH, 900);

    // "Real-time Chat" carries three links (two repos + a live demo) — the
    // block most likely to wrap its link line on a 375 px phone.
    const links = page
      .locator('#projects [data-slot="standard-block"]', {
        hasText: "Real-time Chat",
      })
      .getByRole("link");
    const count = await links.count();
    const boxes = await Promise.all(
      Array.from({ length: count }, (_, i) => links.nth(i).boundingBox()),
    );

    const rowYs = [
      ...new Set(
        boxes.map((box) => {
          if (!box) throw new Error("a project link has no box");
          return Math.round(box.y);
        }),
      ),
    ].sort((a, b) => a - b);

    // Only meaningful once the row actually wraps onto more than one line.
    for (let i = 1; i < rowYs.length; i++) {
      const current = rowYs[i];
      const previous = rowYs[i - 1];
      if (current === undefined || previous === undefined) continue;
      expect(current - previous).toBeGreaterThanOrEqual(8);
    }
  });

  // #272: the links used to share the name's row via `justify-between`, so
  // the row wrapped onto its own line unpredictably — differently per name
  // length and per breakpoint. The name is now always its own row and the
  // links are the block's last row, under the description and the tech
  // stack, at every width — checked at a phone, tablet and desktop width.
  for (const width of [PHONE_WIDTH, TABLET_WIDTH, DESKTOP_WIDTH]) {
    test(`keeps each project's link row below its name and description at ${width}`, async ({
      page,
    }) => {
      await openHomeAt(page, width, 900);

      const blocks = page.locator('#projects [data-slot="standard-block"]');
      const blockCount = await blocks.count();
      expect(blockCount).toBeGreaterThan(0);

      for (let i = 0; i < blockCount; i++) {
        const block = blocks.nth(i);
        const name = block.getByRole("heading", { level: 3 });
        // The description and (when it exists) the tech-stack line are both
        // <p>s — `.last()` reaches the tech stack when there is one, and
        // falls back to the description itself when there isn't, so this
        // checks the AC's "below the description AND the tech stack" as one
        // box rather than trusting DOM order to imply it.
        const lastTextRow = block.getByRole("paragraph").last();
        // StandardBlock itself renders one <div> (the block's own root); the
        // links wrapper is the only OTHER direct-child <div> a project block
        // ever renders, so `> div` reaches straight past the name/description/
        // stack rows (an <h3> and <p>s) to the link row.
        const linkRow = block.locator("> div");

        const [nameBox, lastTextBox, linkBox] = await Promise.all([
          name.boundingBox(),
          lastTextRow.boundingBox(),
          linkRow.boundingBox(),
        ]);
        if (!nameBox || !lastTextBox || !linkBox) {
          throw new Error("a project row has no box");
        }

        // Never on the name's row any more — the row this ticket splits apart.
        expect(linkBox.y).toBeGreaterThan(nameBox.y + nameBox.height - 1);
        // Below the description and the tech stack (whichever is last).
        expect(linkBox.y).toBeGreaterThanOrEqual(
          lastTextBox.y + lastTextBox.height - 1,
        );
      }
    });
  }
});
