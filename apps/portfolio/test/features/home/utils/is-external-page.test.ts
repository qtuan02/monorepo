import { describe, expect, it } from "vitest";

import { isExternalPage } from "~/features/home/utils/is-external-page";

/**
 * The one decision behind `target="_blank"` on every hero and Contact link. A
 * wrong answer is silent in a jsdom render — nothing throws when a `mailto:`
 * opens an empty tab — so the branches are pinned here by scheme.
 */
describe("isExternalPage", () => {
  it.each(["https://github.com/qtuan02", "http://example.test/page"])(
    "treats %s as a page a new tab can hold",
    (href) => {
      expect(isExternalPage(href)).toBe(true);
    },
  );

  it.each(["mailto:someone@example.test", "tel:+84393653862", "/", "#contact"])(
    "treats %s as a hand-off, never a new tab",
    (href) => {
      expect(isExternalPage(href)).toBe(false);
    },
  );
});
