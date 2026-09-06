import { describe, expect, it } from "vitest";

import { languages, messages } from "@monorepo/i18n/languages";

import {
  CONTACT_ITEMS,
  EDUCATION_ITEMS,
  HERO_ACTIONS,
  HOBBY_ITEMS,
  SKILL_GROUPS,
  WORK_ITEMS,
} from "~/features/home/constants/resume";

/**
 * The CV is split down the middle: structure (ids, order, logos, which bullets
 * a role has) lives in the slice's constants, and every string a reader sees
 * lives in `@monorepo/i18n` under `portfolio.*`. The two halves are joined at
 * render time by the item's id — and next-intl renders a **missing key as the
 * key path**, so a typo or a dropped translation ships as `portfolio.work.…`
 * printed on the page instead of throwing anywhere.
 *
 * Nothing else catches that: the constants typecheck, the catalogue typechecks,
 * and neither knows about the other.
 */
function readMessage(locale: string, path: string): unknown {
  const segments = path.split(".");
  let current: unknown = messages[locale as keyof typeof messages];

  for (const segment of segments) {
    if (typeof current !== "object" || current === null) return undefined;
    current = (current as Record<string, unknown>)[segment];
  }

  return current;
}

function expectMessage(locale: string, path: string) {
  const value = readMessage(locale, path);

  expect(value, `${locale}: ${path}`).toBeTypeOf("string");
  expect(String(value).trim(), `${locale}: ${path}`).not.toBe("");
}

describe.each(languages)(
  "resume constants against the %s catalogue",
  (locale) => {
    it("has a role, a period and every bullet for each work item", () => {
      for (const item of WORK_ITEMS) {
        expectMessage(locale, `portfolio.work.items.${item.id}.role`);
        expectMessage(locale, `portfolio.work.items.${item.id}.period`);

        for (const key of item.bulletKeys) {
          expectMessage(
            locale,
            `portfolio.work.items.${item.id}.bullets.${key}`,
          );
        }
      }
    });

    it("has a badge label and a tooltip for a work item that carries an award", () => {
      for (const item of WORK_ITEMS) {
        if (!item.award) continue;

        const path = `portfolio.work.items.${item.id}.awards.${item.award}`;

        expectMessage(locale, `${path}.label`);
        expectMessage(locale, `${path}.tooltip`);
      }
    });

    it("has a degree and a period for each education item", () => {
      for (const item of EDUCATION_ITEMS) {
        expectMessage(locale, `portfolio.education.items.${item.id}.degree`);
        expectMessage(locale, `portfolio.education.items.${item.id}.period`);
      }
    });

    it("has a label for each contact and hobby line", () => {
      for (const item of CONTACT_ITEMS) {
        expectMessage(locale, `portfolio.contact.items.${item.id}`);
      }

      for (const item of HOBBY_ITEMS) {
        expectMessage(locale, `portfolio.hobbies.items.${item.id}`);
      }
    });

    it("has the hero's positioning, current line and every quick action", () => {
      // The hero is what a five-second reader and an unfurl preview see, so a
      // key missing in one locale is the most expensive kind: it ships the key
      // path itself as the sentence naming what the candidate does.
      expectMessage(locale, "portfolio.hero.positioning");
      expectMessage(locale, "portfolio.hero.current");

      for (const action of HERO_ACTIONS) {
        expectMessage(locale, `portfolio.hero.actions.${action.id}`);
      }

      expectMessage(locale, "portfolio.hero.actions.print");
    });

    it("has a label for every skill group", () => {
      for (const group of SKILL_GROUPS) {
        expectMessage(locale, `portfolio.skills.groups.${group.id}`);
      }
    });

    it("has every section heading the template renders", () => {
      for (const section of [
        "about",
        "work",
        "education",
        "skills",
        "contact",
        "hobbies",
      ]) {
        expectMessage(locale, `portfolio.${section}.title`);
      }
    });
  },
);

describe("resume constants", () => {
  it("keeps every id unique, since the id is both the React key and the message key", () => {
    const ids = [
      ...WORK_ITEMS.map((item) => item.id),
      ...EDUCATION_ITEMS.map((item) => item.id),
    ];

    expect(new Set(ids).size).toBe(ids.length);
  });

  it("keeps every skill group id unique and lists no skill twice", () => {
    const ids = SKILL_GROUPS.map((group) => group.id);

    expect(new Set(ids).size).toBe(ids.length);

    // A skill in two groups is not a typo the compiler can see, and on screen
    // it reads as padding — the section's claim is a map of what is known,
    // not a longer list.
    const skills = SKILL_GROUPS.flatMap((group) => group.skills);

    expect(new Set(skills).size).toBe(skills.length);
  });

  it("carries an award badge on the one role that earned one", () => {
    // A badge is a claim about a real prize, so it is worth pinning which rows
    // make it: a stray `award` copied onto another row would publish a claim
    // nobody would notice in review.
    const withAward = WORK_ITEMS.filter((item) => item.award);

    expect(withAward.map((item) => item.id)).toEqual(["arobid"]);
  });

  it("gives a contact line an href only when it leads somewhere", () => {
    // A birthday and a city are facts, not destinations — the legacy site put
    // `href="#"` on both, which reads as a link to a screen reader and does
    // nothing on click.
    const withHref = CONTACT_ITEMS.filter((item) => item.href);

    expect(withHref.map((item) => item.id)).toEqual([
      "phone",
      "github",
      "email",
      "linkedin",
    ]);
    for (const item of withHref) {
      expect(item.href).not.toBe("#");
    }
  });
});
