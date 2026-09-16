import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import OpenGraphCard, {
  OPEN_GRAPH_PALETTE,
} from "~/features/home/components/open-graph-card";
import { oklchToRgb, parseOklch, rgbToHex } from "../../../support/contrast";
import {
  declarationsOf,
  declared,
  unconditional,
  withoutComments,
} from "../../../support/css-tokens";

/**
 * Satori lays the card out from the `style` objects and never reads a
 * stylesheet, so the element tree — rendered here to static markup — *is* the
 * whole design: every colour, edge and shadow the share card carries is a
 * literal in it, and that is what this file reads.
 */
const CARD = {
  title: "Huỳnh Quốc Tuấn",
  positioning: "Frontend-led full-stack engineer — web, mobile và backend.",
  host: "example.test",
} as const;

const markup = renderToStaticMarkup(<OpenGraphCard {...CARD} />);

/** How many times `needle` occurs in the markup. */
function count(needle: string): number {
  return markup.split(needle).length - 1;
}

describe("OpenGraphCard", () => {
  it("renders the name, the positioning line and the host it is handed", () => {
    expect(markup).toContain(CARD.title);
    expect(markup).toContain(CARD.positioning);
    expect(markup).toContain(CARD.host);
  });

  describe("is drawn in the page's grammar — hard edge, solid shadow, no radius", () => {
    it("declares no border radius on any element", () => {
      expect(markup).not.toMatch(/border-radius/);
    });

    it("gives the block a solid ink border", () => {
      expect(markup).toMatch(
        new RegExp(`border:\\d+px solid ${OPEN_GRAPH_PALETTE.ink}`),
      );
    });

    it("casts one solid offset shadow in ink — equal offsets, no blur, no spread", () => {
      const shadows = [...markup.matchAll(/box-shadow:([^;"]+)/g)].map(
        (match) => match[1],
      );

      expect(shadows).toHaveLength(1);
      // A blurred or spread shadow is the soft one the page has left behind.
      expect(shadows[0]).toMatch(
        new RegExp(`^(\\d+)px \\1px 0 ${OPEN_GRAPH_PALETTE.ink}$`),
      );
    });

    it("fills exactly one slab with the highlight yellow, and it is the name", () => {
      expect(count(`background:${OPEN_GRAPH_PALETTE.highlight}`)).toBe(1);
      // The name is the text inside the highlighted element, not merely
      // somewhere after it.
      expect(markup).toMatch(
        new RegExp(
          `background:${OPEN_GRAPH_PALETTE.highlight};[^"]*"[^>]*>${CARD.title}<`,
        ),
      );
    });

    it("uses indigo for text details only — never as a fill or an edge", () => {
      expect(count(`color:${OPEN_GRAPH_PALETTE.primary}`)).toBeGreaterThan(0);
      expect(markup).not.toContain(`background:${OPEN_GRAPH_PALETTE.primary}`);
      expect(markup).not.toMatch(
        new RegExp(`solid ${OPEN_GRAPH_PALETTE.primary}`),
      );
    });
  });

  /**
   * The card is a preview of the page, so its literals are held to the page's
   * own tokens — the light theme, read as text the same way
   * `test/globals.test.ts` reads it, and resolved the way the cascade does: the
   * app's override when it declares the token, the shared theme when it does
   * not. Pinning a token to one file would let an override the app adds later
   * go unread here, and the card would drift while the test stayed green.
   */
  describe("spells out the app's light theme", () => {
    // `process.cwd()` is the app root — Vitest sets it from this project's config.
    const appRoot = process.cwd();
    const override = declarationsOf(
      unconditional(
        withoutComments(
          readFileSync(resolve(appRoot, "src/globals.css"), "utf8"),
        ),
      ),
      ":root",
    );
    const theme = declarationsOf(
      withoutComments(
        readFileSync(
          resolve(appRoot, "../../tooling/tailwind/theme.css"),
          "utf8",
        ),
      ),
      ":root",
    );
    const hexOf = (token: string) =>
      rgbToHex(
        oklchToRgb(parseOklch(override[token] ?? declared(theme, token))),
      );

    it.each([
      ["background", "background"],
      ["card", "card"],
      ["ink", "foreground"],
      ["ink", "border"],
      ["ink", "hard-shadow"],
      ["highlight", "highlight"],
      ["primary", "primary"],
    ] as const)("%s is the sRGB of --%s", (literal, token) => {
      expect(OPEN_GRAPH_PALETTE[literal]).toBe(hexOf(token));
    });

    it("paints with those literals and no other colour", () => {
      const colours = new Set(
        [...markup.matchAll(/#[0-9a-f]{6}\b/g)].map((match) => match[0]),
      );

      expect([...colours].sort()).toEqual(
        Object.values(OPEN_GRAPH_PALETTE).sort(),
      );
    });
  });
});
