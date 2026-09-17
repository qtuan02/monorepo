import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";

import { componentCatalogue } from "~/constants/docs-catalogue";
import ComponentTile from "~/features/component/components/component-tile";
import SearchPalette from "~/features/layout/components/nav/search-palette";

const appRoot = resolve(import.meta.dirname, "../../..");

/** The `--h` a swatch under `root` was painted with. */
function hueOf(root: HTMLElement): string {
  const swatch = root.querySelector<HTMLElement>(".swatch-gradient");
  if (!swatch) throw new Error("no swatch rendered");
  return swatch.style.getPropertyValue("--h");
}

describe("a tile", () => {
  it("paints the same hue for a slug as the search palette does", () => {
    const entry = componentCatalogue.items.find(
      (item) => item.slug === "dialog",
    );
    if (!entry) throw new Error("`dialog` is missing from the catalogue");

    // Rendered one after the other: an open dialog hides everything outside it
    // from the accessibility tree, tile included.
    const { unmount } = render(
      <MemoryRouter>
        <ComponentTile entry={entry} />
      </MemoryRouter>,
    );
    const tileHue = hueOf(screen.getByRole("link", { name: /^dialog/ }));
    unmount();

    render(
      <MemoryRouter>
        <SearchPalette open onOpenChange={() => {}} />
      </MemoryRouter>,
    );
    const rowHue = hueOf(screen.getByRole("option", { name: /^dialog/ }));

    expect(tileHue).not.toBe("");
    expect(tileHue).toBe(rowHue);
  });

  it("blurs nothing — no backdrop-filter and no glass, only a lift and a shadow on hover", () => {
    // Sixty tiles on one screen is a GPU cost (brief §10 row 8): the surface is
    // an opaque-ish fill, and the stylesheet's `tile` utility must stay one.
    const tile = readFileSync(
      resolve(appRoot, "src/components/tile/tile.tsx"),
      "utf8",
    );
    const css = readFileSync(resolve(appRoot, "src/globals.css"), "utf8");
    const tileUtility = css.slice(css.indexOf("@utility tile"));
    const tileBlock = tileUtility.slice(0, tileUtility.indexOf("}") + 1);

    expect(tile).not.toMatch(/backdrop/);
    expect(tile).not.toMatch(/(^|[\s"'`])glass([\s"'`]|$)/);
    expect(tileBlock).not.toMatch(/backdrop-filter/);

    for (const hover of tile.match(/hover:[\w[\]()/.-]+/g) ?? []) {
      expect(hover).toMatch(/^hover:(-?translate-|shadow-|glass-deep)/);
    }
  });
});
