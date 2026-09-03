/**
 * One item of the page-number window a pagination bar renders — a real page
 * button, or a gap the window skipped. `key` on an ellipsis is a stable named
 * value ("start"/"end") rather than an index: the window is one contiguous run
 * around the current page plus the two edges, so it can skip at most once on
 * each side however wide it is (see .agents/rules/quality-list-keys.md).
 */
export type PaginationPageItem =
  | { type: "page"; page: number }
  | { type: "ellipsis"; key: "start" | "end" };

const DEFAULT_SIBLING_COUNT = 1;

export type BuildPaginationPagesOptions = {
  /**
   * How many pages to keep on each side of the current one. `1` (the default)
   * gives the familiar `1 … 4 5 6 … 10`; `0` narrows it to `1 … 5 … 10`, which
   * is what a bar too narrow for seven controls can afford.
   */
  siblingCount?: number;
};

/**
 * Builds the page-number window a pagination bar renders: always page 1 and the
 * last page, `currentPage` and `siblingCount` pages on each side, with an
 * ellipsis wherever the window skips pages.
 *
 * It lives beside the `pagination` primitive rather than in an app because every
 * pagination bar asks the same question of the same two numbers, and the answer
 * is pure arithmetic: no React, no DOM, nothing to know about how the window is
 * rendered. `pagination.tsx` itself only draws what this returns.
 */
export function buildPaginationPages(
  currentPage: number,
  totalPages: number,
  { siblingCount = DEFAULT_SIBLING_COUNT }: BuildPaginationPagesOptions = {},
): PaginationPageItem[] {
  if (totalPages <= 0) return [];
  if (totalPages === 1) return [{ type: "page", page: 1 }];

  const pageSet = new Set<number>([1, totalPages]);
  for (
    let page = currentPage - siblingCount;
    page <= currentPage + siblingCount;
    page++
  ) {
    if (page >= 1 && page <= totalPages) pageSet.add(page);
  }

  const sortedPages = [...pageSet].sort((a, b) => a - b);

  const items: PaginationPageItem[] = [];
  for (const [index, page] of sortedPages.entries()) {
    const previousPage = sortedPages[index - 1];
    if (previousPage !== undefined && page - previousPage > 1) {
      // Which side a gap is on is decided against the CURRENT page, never
      // against its position in the array: on page 1 of 13 the window is
      // `1 … 13`, whose only gap sits at index 1 and yet skips FORWARD. Reading
      // the index there labelled it "start", and a control that acts on the side
      // then walked backwards from page 1. A gap ending at or before the current
      // page is behind the user; anything else is ahead of them — and there is
      // at most one of each.
      items.push({
        type: "ellipsis",
        key: page <= currentPage ? "start" : "end",
      });
    }
    items.push({ type: "page", page });
  }

  return items;
}
