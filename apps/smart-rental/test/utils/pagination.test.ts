import { describe, expect, it } from "vitest";

import { clampPage, getPageItems, getTotalPages } from "~/utils/pagination";

// The one pagination the prototype had four copies of (spec #127): two of them
// returned 0 pages for an empty list, and one clamped the page from one side
// only — both branches are pinned here.
describe("getTotalPages", () => {
  it("is never below 1, even for an empty list", () => {
    expect(getTotalPages(0, 10)).toBe(1);
  });

  it("rounds a partial last page up", () => {
    expect(getTotalPages(45, 10)).toBe(5);
    expect(getTotalPages(50, 10)).toBe(5);
    expect(getTotalPages(51, 10)).toBe(6);
  });
});

describe("clampPage", () => {
  it("clamps from both sides", () => {
    expect(clampPage(0, 5)).toBe(1);
    expect(clampPage(-3, 5)).toBe(1);
    expect(clampPage(9, 5)).toBe(5);
    expect(clampPage(3, 5)).toBe(3);
  });

  it("lands on page 1 when there are no pages", () => {
    expect(clampPage(4, 0)).toBe(1);
  });

  it("treats a non-number (a mistyped URL) as page 1", () => {
    expect(clampPage(Number.NaN, 5)).toBe(1);
  });
});

describe("getPageItems", () => {
  it("lists every page when there are few", () => {
    expect(getPageItems(2, 5)).toEqual([1, 2, 3, 4, 5]);
  });

  it("collapses the far side into an ellipsis", () => {
    expect(getPageItems(1, 10)).toEqual([1, 2, "ellipsis", 10]);
    expect(getPageItems(5, 10)).toEqual([
      1,
      "ellipsis",
      4,
      5,
      6,
      "ellipsis",
      10,
    ]);
    expect(getPageItems(10, 10)).toEqual([1, "ellipsis", 9, 10]);
  });
});
