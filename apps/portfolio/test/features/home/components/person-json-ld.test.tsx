import { describe, expect, it, vi } from "vitest";

import { messages } from "@monorepo/i18n/languages";

import { PROFILE_LINKS } from "~/constants/profile";
import PersonJsonLd from "~/features/home/components/person-json-ld";
import { routing } from "~/i18n/routing";
import { render } from "../../../support/render";

// `~/i18n/navigation` is next-intl's `createNavigation`, which reaches for
// `next/navigation` — a module that does not resolve outside a Next runtime, and
// the reason `sitemap.ts` has no unit test either. The prefix rule it encodes is
// the router's own and is asserted end to end by `e2e/locale-switch.e2e.ts`;
// what is under test here is the JSON-LD, so the helper is stubbed with a path
// that is merely recognisable.
vi.mock("~/i18n/navigation", () => ({
  getPathname: ({ locale, href }: { locale: string; href: string }) =>
    `/${locale}${href}`,
}));

/**
 * Structured data is the one thing on this page nobody will ever notice
 * breaking: it renders no pixels, so a wrong shape, a `[object Object]` or an
 * unparseable body looks exactly like a correct one in a browser — and a
 * crawler simply drops the block.
 *
 * So the assertions are the two a validator would make: the body parses as
 * JSON, and the fields a `Person` is actually indexed on are the same values
 * the visible page renders from rather than a second copy that can drift.
 */
describe("PersonJsonLd", () => {
  const catalogue = messages[routing.defaultLocale].portfolio;

  function parsed() {
    const { container } = render(<PersonJsonLd />);
    const script = container.querySelector(
      'script[type="application/ld+json"]',
    );

    expect(script).not.toBeNull();

    return JSON.parse(script?.textContent ?? "") as Record<string, unknown>;
  }

  it("emits a schema.org Person carrying the page's own name and title", () => {
    const person = parsed();

    expect(person["@context"]).toBe("https://schema.org");
    expect(person["@type"]).toBe("Person");
    expect(person.name).toBe(catalogue.hero.name);
    // The job title a recruiter searches for, read from the same key the hero's
    // yellow slab renders — not a literal spelled a second time here.
    expect(person.jobTitle).toBe(catalogue.hero.role);
    expect(person.description).toBe(catalogue.meta.description);
  });

  it("points `sameAs` at the two profiles the CV links to", () => {
    // `sameAs` is what ties this page to the accounts a search engine already
    // knows; an address typed by hand here would verify nothing.
    expect(parsed().sameAs).toEqual([
      PROFILE_LINKS.github,
      PROFILE_LINKS.linkedin,
    ]);
  });

  it("gives every URL it emits an absolute form", () => {
    const person = parsed();

    // A relative `url` or `image` is ignored outright — the crawler has no base
    // to resolve it against, which is exactly what `metadataBase` exists for on
    // the metadata side.
    for (const key of ["url", "image"]) {
      expect(String(person[key]), key).toMatch(/^https?:\/\//);
    }
  });
});
