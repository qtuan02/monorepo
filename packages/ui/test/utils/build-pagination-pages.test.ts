import { describe, expect, it } from "vitest";

import { buildPaginationPages } from "../../src/utils/build-pagination-pages";

describe("buildPaginationPages", () => {
  it("returns an empty window when there are no pages", () => {
    expect(buildPaginationPages(1, 0)).toEqual([]);
  });

  it("returns a single page item when there is only one page", () => {
    expect(buildPaginationPages(1, 1)).toEqual([{ type: "page", page: 1 }]);
  });

  it("renders every page with no ellipsis when the range is small", () => {
    expect(buildPaginationPages(2, 4)).toEqual([
      { type: "page", page: 1 },
      { type: "page", page: 2 },
      { type: "page", page: 3 },
      { type: "page", page: 4 },
    ]);
  });

  it("shows an ellipsis on both sides when the current page sits in the middle", () => {
    expect(buildPaginationPages(5, 10)).toEqual([
      { type: "page", page: 1 },
      { type: "ellipsis", key: "start" },
      { type: "page", page: 4 },
      { type: "page", page: 5 },
      { type: "page", page: 6 },
      { type: "ellipsis", key: "end" },
      { type: "page", page: 10 },
    ]);
  });

  it("shows an ellipsis only on the right side when on the first page", () => {
    expect(buildPaginationPages(1, 10)).toEqual([
      { type: "page", page: 1 },
      { type: "page", page: 2 },
      { type: "ellipsis", key: "end" },
      { type: "page", page: 10 },
    ]);
  });

  it("shows an ellipsis only on the left side when on the last page", () => {
    expect(buildPaginationPages(10, 10)).toEqual([
      { type: "page", page: 1 },
      { type: "ellipsis", key: "start" },
      { type: "page", page: 9 },
      { type: "page", page: 10 },
    ]);
  });

  it("drops the siblings when the bar has no room for them", () => {
    // What a bar too narrow for seven controls renders: the two edges and
    // where the user is, and nothing else.
    expect(buildPaginationPages(5, 10, { siblingCount: 0 })).toEqual([
      { type: "page", page: 1 },
      { type: "ellipsis", key: "start" },
      { type: "page", page: 5 },
      { type: "ellipsis", key: "end" },
      { type: "page", page: 10 },
    ]);
  });

  it("still runs the short list unbroken with no siblings", () => {
    expect(buildPaginationPages(2, 3, { siblingCount: 0 })).toEqual([
      { type: "page", page: 1 },
      { type: "page", page: 2 },
      { type: "page", page: 3 },
    ]);
  });

  it("calls the gap on page 1 a forward one, wherever it sits in the array", () => {
    // The regression this guards: on page 1 the window is "1 … 13", whose only
    // gap sits at array index 1 — and labelling by index called that "start",
    // so a control that skips by side walked BACKWARDS from the first page.
    expect(buildPaginationPages(1, 13, { siblingCount: 0 })).toEqual([
      { type: "page", page: 1 },
      { type: "ellipsis", key: "end" },
      { type: "page", page: 13 },
    ]);
  });

  it("calls the gap on the last page a backward one", () => {
    expect(buildPaginationPages(13, 13, { siblingCount: 0 })).toEqual([
      { type: "page", page: 1 },
      { type: "ellipsis", key: "start" },
      { type: "page", page: 13 },
    ]);
  });

  it("names a gap against the current page even when it is the second item", () => {
    expect(buildPaginationPages(2, 10)).toEqual([
      { type: "page", page: 1 },
      { type: "page", page: 2 },
      { type: "page", page: 3 },
      { type: "ellipsis", key: "end" },
      { type: "page", page: 10 },
    ]);
  });
});
