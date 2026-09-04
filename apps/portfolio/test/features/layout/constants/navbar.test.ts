import { describe, expect, it } from "vitest";

import { languages, messages } from "@monorepo/i18n/languages";

import { ROUTES } from "~/constants/routes";
import { NAVBAR_ITEMS } from "~/features/layout/constants/navbar";

/**
 * The dock joins its items to the catalogue by id the same way the CV does, and
 * it carries a second decision on top: `external` picks between a plain `<a>`
 * and next-intl's locale-aware `Link`. Get that wrong on an internal item and
 * the visitor leaves the site's locale behind; get it wrong on an external one
 * and `Link` prefixes an absolute URL.
 */
describe("navbar constants", () => {
  it.each(languages)("has a label for every item in %s", (locale) => {
    const navbar = (
      messages[locale].portfolio as { navbar: Record<string, string> }
    ).navbar;

    for (const item of NAVBAR_ITEMS) {
      expect(navbar[item.id], `${locale}: ${item.id}`).toBeTypeOf("string");
    }
    // The theme button sits beside the links and takes its name from the same
    // namespace, so it belongs to the same check.
    expect(navbar.theme).toBeTypeOf("string");
  });

  it("routes an internal item through the route table, unprefixed", () => {
    const internal = NAVBAR_ITEMS.filter((item) => !item.external);

    expect(internal.map((item) => item.href)).toEqual([ROUTES.HOME]);
    for (const item of internal) {
      // A locale prefix here would be written twice — `Link` adds its own.
      expect(item.href).not.toMatch(/^\/(vi|en)(\/|$)/);
    }
  });

  it("gives every external item an absolute URL", () => {
    const external = NAVBAR_ITEMS.filter((item) => item.external);

    expect(external.length).toBeGreaterThan(0);
    for (const item of external) {
      expect(item.href, item.id).toMatch(/^https:\/\//);
    }
  });
});
