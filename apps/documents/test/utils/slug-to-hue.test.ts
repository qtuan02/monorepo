import { describe, expect, it } from "vitest";

import { componentCatalogue, hookCatalogue } from "~/constants/docs-catalogue";
import { slugToHue } from "~/utils/slug-to-hue";

/**
 * A swatch is an entry's visual signature: the same slug has to paint the same
 * colour on a tile, in the palette and on the detail hero, on every machine.
 */
describe("slugToHue", () => {
  it("is deterministic — the same slug always gives the same hue", () => {
    expect(slugToHue("dialog")).toBe(slugToHue("dialog"));
    expect(slugToHue("dialog")).not.toBe(slugToHue("alert-dialog"));
  });

  it("stays inside [0, 360) for every entry of both catalogues", () => {
    for (const { slug } of [
      ...componentCatalogue.items,
      ...hookCatalogue.items,
    ]) {
      const hue = slugToHue(slug);
      expect(Number.isInteger(hue), slug).toBe(true);
      expect(hue, slug).toBeGreaterThanOrEqual(0);
      expect(hue, slug).toBeLessThan(360);
    }
  });
});
