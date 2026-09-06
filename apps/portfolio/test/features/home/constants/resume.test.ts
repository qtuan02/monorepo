import { describe, expect, it } from "vitest";

import {
  CONTACT_ITEMS,
  EDUCATION_ITEMS,
  PROJECT_ITEMS,
  SKILL_GROUPS,
  WORK_ITEMS,
} from "~/features/home/constants/resume";

/**
 * Invariants of the CV's **structure** — the half of the split that lives here
 * rather than in `@monorepo/i18n`. None of these is a string a reader sees, and
 * none of them is something the compiler can state.
 *
 * That the ids in here resolve to a real message in every language, and that no
 * message is left behind unread, is the join between the two halves and lives in
 * `test/messages.test.ts`.
 */
describe("resume constants", () => {
  it("keeps every id unique, since the id is both the React key and the message key", () => {
    const ids = [
      ...WORK_ITEMS.map((item) => item.id),
      ...PROJECT_ITEMS.map((item) => item.id),
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

  it("ships exactly the three roles the CV claims, newest first", () => {
    // A row coming back — a constants entry re-added by a merge, or a role
    // copied in from the site's own history — is not a cosmetic regression:
    // these rows are what a crawler indexes and what a recruiter's unfurl
    // quotes, so the claim would be published before anyone looked at the page.
    // Pinning the whole list catches any re-addition, where naming the roles
    // that were dropped would only catch the ones already thought of — and
    // would put those companies' names back into the repo, which is what the
    // rebuild spent a ticket removing.
    expect(WORK_ITEMS.map((item) => item.id)).toEqual([
      "medviet",
      "arobid",
      "dcorp",
    ]);
  });

  it("carries an award badge on the one role that earned one", () => {
    // A badge is a claim about a real prize, so it is worth pinning which rows
    // make it: a stray `award` copied onto another row would publish a claim
    // nobody would notice in review.
    const withAward = WORK_ITEMS.filter((item) => item.award);

    expect(withAward.map((item) => item.id)).toEqual(["arobid"]);
  });

  it("caps a project's tech stack at six badges", () => {
    // Above six the chips wrap into a third line inside a card that is one of
    // three across the column, and the design cuts at the data rather than
    // rendering a "+n" overflow — so the cap is enforced where the data lives.
    for (const item of PROJECT_ITEMS) {
      expect(item.techStack.length, item.id).toBeLessThanOrEqual(6);
    }
  });

  it("links every project out over https, and never to the same place twice", () => {
    const hrefs = PROJECT_ITEMS.flatMap((item) => [
      ...(item.source ?? []).map((source) => source.href),
      ...(item.demo ? [item.demo] : []),
    ]);

    expect(hrefs.length).toBeGreaterThan(0);
    expect(new Set(hrefs).size).toBe(hrefs.length);
    for (const href of hrefs) {
      expect(href).toMatch(/^https:\/\//);
    }
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
