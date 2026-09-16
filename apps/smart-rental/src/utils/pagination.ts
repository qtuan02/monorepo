export type PageItem = number | "ellipsis";

/** Pages shown as numbers before the bar collapses the far side into an ellipsis. */
const MAX_VISIBLE_PAGES = 5;

export const DEFAULT_PAGE_SIZE = 12;
export const PAGE_SIZE_OPTIONS = [12, 24, 36, 48, 60];

/** Never below 1: an empty list still has a page 1 to stand on. */
export function getTotalPages(itemCount: number, pageSize: number): number {
  return Math.max(1, Math.ceil(itemCount / pageSize));
}

/** Clamps from both sides; a non-number (a mistyped URL) lands on page 1. */
export function clampPage(page: number, totalPages: number): number {
  const safePage = Number.isFinite(page) ? page : 1;
  return Math.min(Math.max(1, safePage), Math.max(1, totalPages));
}

export function getPageItems(
  currentPage: number,
  totalPages: number,
): PageItem[] {
  const safeTotalPages = Math.max(1, totalPages);
  const safeCurrentPage = clampPage(currentPage, safeTotalPages);

  if (safeTotalPages <= MAX_VISIBLE_PAGES) {
    return Array.from({ length: safeTotalPages }, (_, index) => index + 1);
  }

  const pages: PageItem[] = [1];
  if (safeCurrentPage > 3) pages.push("ellipsis");

  const start = Math.max(2, safeCurrentPage - 1);
  const end = Math.min(safeTotalPages - 1, safeCurrentPage + 1);
  for (let page = start; page <= end; page += 1) pages.push(page);

  if (safeCurrentPage < safeTotalPages - 2) pages.push("ellipsis");
  pages.push(safeTotalPages);

  return pages;
}
