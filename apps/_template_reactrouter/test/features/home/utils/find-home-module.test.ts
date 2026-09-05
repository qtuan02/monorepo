import { describe, expect, it } from "vitest";

import { HOME_CATALOGUE } from "~/features/home/constants/home-catalogue";
import { homeModuleIds } from "~/features/home/types/home-module";
import { findHomeModule } from "~/features/home/utils/find-home-module";

/**
 * The found / not-found decision behind `/modules/:slug`, asserted on the pure
 * function rather than through a router: the route module's loader is one call
 * to this plus a `throw`, so this is where a wrong answer would come from.
 */
describe("findHomeModule", () => {
  it("returns the catalogue entry for a known slug, coming-soon ones included", () => {
    expect(findHomeModule("dashboard")).toEqual({ id: "dashboard" });
    // An unbuilt module is still a page — the home page links to it, so the
    // lookup must not treat `comingSoon` as "missing".
    expect(findHomeModule("pos")).toEqual({ id: "pos", comingSoon: true });
  });

  it("returns undefined for a slug the catalogue does not know", () => {
    expect(findHomeModule("khong-co")).toBeUndefined();
    // Neither a prefix nor a different case is a match: the slug is the id.
    expect(findHomeModule("dash")).toBeUndefined();
    expect(findHomeModule("Dashboard")).toBeUndefined();
    expect(findHomeModule("")).toBeUndefined();
  });

  it("covers every id the registry knows, so a module cannot exist without a page", () => {
    // The ids are message keys AND slugs; a module that translates but has no
    // catalogue entry would be a card the home page cannot render.
    for (const id of homeModuleIds) {
      expect(findHomeModule(id)).toBeDefined();
    }
    expect(HOME_CATALOGUE).toHaveLength(homeModuleIds.length);
  });
});
