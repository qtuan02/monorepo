import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

import { withoutComments } from "./support/css-tokens";

/**
 * `public/icon.svg` is the site's mark — the same conic sweep through the five
 * aurora stops that `nav-brand.tsx` draws with a CSS `conic-gradient`.
 *
 * The two cannot share a source: a file under `public/` is served byte for byte
 * and never sees a custom property, so the SVG spells the five colours as
 * literals. That is the whole reason this test exists — an aurora stop changed
 * in `src/globals.css` would leave the nav mark and the favicon different
 * colours, and nothing anywhere would say so: a favicon is not rendered in any
 * test, it is not type-checked, and a reader compares it to the nav pill only
 * by memory, one browser tab away.
 */
const appRoot = process.cwd();

const icon = readFileSync(resolve(appRoot, "public/icon.svg"), "utf8");
const globals = withoutComments(
  readFileSync(resolve(appRoot, "src/globals.css"), "utf8"),
);

/** Every `--aurora-*` value declared in the stylesheet, lower-cased. */
function auroraStops(): Map<string, string> {
  const stops = new Map<string, string>();

  for (const [, name, value] of globals.matchAll(
    /--aurora-([a-z]+):\s*(#[0-9a-fA-F]{3,8});/g,
  )) {
    if (name && value) stops.set(name, value.toLowerCase());
  }

  return stops;
}

describe("the site icon", () => {
  it("paints only colours the stylesheet declares as aurora stops", () => {
    const stops = auroraStops();

    // The sweep is five stops, so the stylesheet must have at least that many
    // — a rename that emptied this map would otherwise make every assertion
    // below vacuous.
    expect(stops.size).toBeGreaterThanOrEqual(5);

    const painted = [...icon.matchAll(/stop-color="(#[0-9a-fA-F]{3,8})"/g)].map(
      ([, colour]) => colour?.toLowerCase(),
    );
    const declaredValues = [...stops.values()];

    expect(painted.length).toBeGreaterThan(0);

    for (const colour of painted) {
      expect(declaredValues, `${colour} is not an aurora stop`).toContain(
        colour,
      );
    }
  });

  it("sweeps through five distinct stops, the way the nav mark does", () => {
    const painted = new Set(
      [...icon.matchAll(/stop-color="(#[0-9a-fA-F]{3,8})"/g)].map(
        ([, colour]) => colour?.toLowerCase(),
      ),
    );

    // Five wedges, each a gradient between the two stops it sits between, so
    // every stop appears twice and the set is exactly the five. Fewer would
    // mean a wedge lost its pair and the ring has a flat band in it.
    expect(painted.size).toBe(5);
  });
});
