import { describe, expect, it } from "vitest";

import type { DocsEntry } from "~/types/docs-catalogue";
import { filterCatalogue, scoreSlug } from "~/utils/filter-catalogue";

function entry(slug: string): DocsEntry {
  return {
    slug,
    subpath: `components/${slug}`,
    importPath: `@fe-monorepo/ui/components/${slug}`,
    exports: [],
    description: null,
  };
}

const items = [
  entry("navigation-menu"),
  entry("menubar"),
  entry("menu"),
  entry("dropdown-menu"),
];

describe("scoreSlug", () => {
  it("ranks an exact hit above a prefix, and a prefix above a substring", () => {
    expect(scoreSlug("menu", "menu")).toBeGreaterThan(
      scoreSlug("menubar", "menu"),
    );
    expect(scoreSlug("menubar", "menu")).toBeGreaterThan(
      scoreSlug("dropdown-menu", "menu"),
    );
  });

  it("scores a slug the query does not appear in at all as zero", () => {
    expect(scoreSlug("button", "menu")).toBe(0);
  });
});

describe("filterCatalogue", () => {
  it("returns the whole list for an empty or whitespace query", () => {
    // The list page renders this result directly, so "no filter" has to mean
    // "everything" rather than "nothing".
    expect(filterCatalogue(items, "")).toHaveLength(items.length);
    expect(filterCatalogue(items, "   ")).toHaveLength(items.length);
  });

  it("orders best match first, then alphabetically", () => {
    expect(filterCatalogue(items, "menu").map((item) => item.slug)).toEqual([
      "menu",
      "menubar",
      "dropdown-menu",
      "navigation-menu",
    ]);
  });

  it("ignores case and surrounding whitespace in the query", () => {
    expect(filterCatalogue(items, "  MENU  ").map((item) => item.slug)).toEqual(
      filterCatalogue(items, "menu").map((item) => item.slug),
    );
  });

  it("drops everything when nothing matches", () => {
    expect(filterCatalogue(items, "button")).toEqual([]);
  });

  it("never hands back the caller's array", () => {
    // The list page holds the catalogue that is baked into the bundle; sorting
    // it in place would permanently reorder the sidebar too.
    expect(filterCatalogue(items, "")).not.toBe(items);
  });
});
