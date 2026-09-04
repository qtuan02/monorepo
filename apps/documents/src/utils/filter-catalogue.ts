import type { DocsEntry } from "~/types/docs-catalogue";

const EXACT_MATCH_SCORE = 100;
const PREFIX_MATCH_SCORE = 80;
const CONTAINS_MATCH_SCORE = 50;
const NO_MATCH_SCORE = 0;

/**
 * How well `slug` answers `query`, on the three-step scale the legacy site
 * used: an exact hit beats a prefix, a prefix beats a substring. Both sides are
 * expected lower-cased and trimmed by the caller.
 */
export function scoreSlug(slug: string, query: string): number {
  if (slug === query) return EXACT_MATCH_SCORE;
  if (slug.startsWith(query)) return PREFIX_MATCH_SCORE;
  if (slug.includes(query)) return CONTAINS_MATCH_SCORE;

  return NO_MATCH_SCORE;
}

/**
 * Filters one catalogue by slug, best match first, ties broken alphabetically
 * so the order never depends on the order the generator happened to write.
 *
 * An empty query returns the whole list unchanged — the list page renders this
 * directly, so "no filter" has to mean "everything", not "nothing".
 */
export function filterCatalogue<TEntry extends DocsEntry>(
  items: readonly TEntry[],
  query: string,
): TEntry[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return [...items];

  return items
    .map((item) => ({ item, score: scoreSlug(item.slug, normalized) }))
    .filter((scored) => scored.score > NO_MATCH_SCORE)
    .sort(
      (left, right) =>
        right.score - left.score ||
        left.item.slug.localeCompare(right.item.slug),
    )
    .map((scored) => scored.item);
}
