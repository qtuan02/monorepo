import { describe, expect, it } from "vitest";

import HomeTemplate from "~/features/home/templates/home.template";
import { render } from "../../../support/render";

/**
 * The CV is read top to bottom in one pass, so the order of its sections is an
 * argument rather than a layout detail: Work before Projects because employment
 * is the stronger claim, Skills before Education because a recruiter reading a
 * mid-career CV wants the stack before the degree.
 *
 * It is pinned here because nothing else can see it. Each section is its own
 * component with its own test, the template that sequences them has no logic to
 * typecheck, and two tickets adding a section in parallel is exactly how the
 * order drifted once already — silently, since every section still rendered.
 */
describe("HomeTemplate", () => {
  it("renders every section once, in the order the CV is meant to be read", () => {
    const { container } = render(<HomeTemplate />);

    const ids = [...container.querySelectorAll("section[id]")].map(
      (section) => section.id,
    );

    expect(ids).toEqual([
      "hero",
      "about",
      "work",
      "projects",
      "skills",
      "education",
      "contact",
      "hobbies",
    ]);
  });

  it("keeps the heading outline sequential, with exactly one h1", () => {
    // A skipped level is invisible on screen — the styles come from `className`,
    // not the tag — and only shows up to someone cycling headings with a screen
    // reader, or to an indexer reading the outline.
    const { container } = render(<HomeTemplate />);

    const levels = [
      ...container.querySelectorAll("h1, h2, h3, h4, h5, h6"),
    ].map((heading) => Number(heading.tagName.slice(1)));

    expect(levels.filter((level) => level === 1)).toHaveLength(1);
    expect(levels[0]).toBe(1);

    for (const [index, level] of levels.entries()) {
      if (index === 0) continue;

      const previous = levels[index - 1] as number;

      expect(
        level,
        `heading ${index} (h${previous} → h${level})`,
      ).toBeLessThanOrEqual(previous + 1);
    }
  });
});
