/**
 * The hue of an entry's swatch, derived from its slug so the same primitive
 * paints the same colour everywhere it appears. djb2 — the classic string hash —
 * kept in 32-bit with `| 0`, then `>>> 0` to read it unsigned before `% 360`
 * so the result is never negative.
 */
export function slugToHue(slug: string): number {
  let hash = 5381;

  for (let index = 0; index < slug.length; index++) {
    hash = ((hash << 5) + hash + slug.charCodeAt(index)) | 0;
  }

  return (hash >>> 0) % 360;
}
