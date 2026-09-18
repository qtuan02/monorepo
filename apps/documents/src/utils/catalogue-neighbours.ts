/**
 * The entries either side of `slug` in a catalogue, in the order the generator
 * sorted it — which is the reading order of the site (glossary: *Catalogue*).
 * No wrap-around: at either end the missing side is `undefined`, and a detail
 * page hides that button rather than pointing at the other end of the list.
 */
export function catalogueNeighbours<T extends { slug: string }>(
  items: readonly T[],
  slug: string,
): { prev: T | undefined; next: T | undefined } {
  const index = items.findIndex((item) => item.slug === slug);
  if (index === -1) return { prev: undefined, next: undefined };

  return { prev: items[index - 1], next: items[index + 1] };
}
