import { describe, expect, it } from "vitest";

import { catalogueNeighbours } from "~/utils/catalogue-neighbours";

const items = [{ slug: "a" }, { slug: "b" }, { slug: "c" }];

/**
 * The prev/next pair on a detail page comes from the entry's position in the
 * catalogue the generator already sorted — no wrap-around, and nothing at
 * either end, so the first page has no "previous" and the last no "next".
 */
describe("catalogueNeighbours", () => {
  it("returns both neighbours for an entry in the middle", () => {
    expect(catalogueNeighbours(items, "b")).toEqual({
      prev: items[0],
      next: items[2],
    });
  });

  it("has no previous at the first entry and no next at the last", () => {
    expect(catalogueNeighbours(items, "a")).toEqual({
      prev: undefined,
      next: items[1],
    });
    expect(catalogueNeighbours(items, "c")).toEqual({
      prev: items[1],
      next: undefined,
    });
  });

  it("returns nothing for a slug the catalogue does not have", () => {
    expect(catalogueNeighbours(items, "zzz")).toEqual({
      prev: undefined,
      next: undefined,
    });
  });
});
