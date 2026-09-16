import { expect, test } from "@playwright/test";

import { ROUTES } from "../src/constants/routes";
import { hexToRgb, rgbDistance } from "../test/support/contrast";

/**
 * The dock's redesign is geometry a browser has to lay out: a square frame
 * with a hard edge and a solid offset shadow, four controls each big enough for
 * a thumb and far enough apart not to catch the next one, and nothing that
 * grows under the pointer. A jsdom render sees none of that — it computes no
 * layout — so this is where the ticket's numbers are measured.
 */

/** WCAG's target-size floor, and the gap that keeps two targets apart. */
const MIN_TARGET = 44;
const MIN_GAP = 8;

/** The shadow colour `src/globals.css` declares as `--hard-shadow`, per theme. */
const HARD_SHADOW = { light: "#0a0a0a", dark: "#fafafa" } as const;

/** A rounding step or two apart — the same colour. */
const SAME_COLOUR = 4;

/** The four controls, in document order — each one carries its own name. */
function dockControls(page: import("@playwright/test").Page) {
  return page.getByRole("navigation").locator("[aria-label]");
}

test.describe("the dock", () => {
  test("is a square frame with a 2px edge and a solid shadow, in both themes", async ({
    page,
  }) => {
    for (const theme of ["light", "dark"] as const) {
      await page.addInitScript((stored) => {
        window.localStorage.setItem("theme", stored);
      }, theme);
      await page.goto(ROUTES.HOME);
      await expect(page.locator("html")).toHaveClass(
        new RegExp(`\\b${theme}\\b`),
      );

      const dock = page.getByRole("navigation");
      const frame = await dock.evaluate((node) => {
        const style = getComputedStyle(node);

        // Tailwind composes `box-shadow` from its inset, ring and shadow
        // variables, so the computed value is a stack of transparent layers
        // with the real one last — and a production build serialises its
        // colour as `lab(…)`, not the `rgb()` the source declared. So the
        // last layer's geometry is read off the string, and its colour is
        // painted onto a canvas to get the 8-bit sRGB a compositor would.
        const layer = style.boxShadow.match(
          /(?<colour>[a-z]+\([^)]*\)) (?<geometry>[^,]+)$/,
        );
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");

        if (!context) throw new Error("No 2d context");

        context.fillStyle = layer?.groups?.colour ?? "transparent";
        context.fillRect(0, 0, 1, 1);

        const [r = 0, g = 0, b = 0] = context.getImageData(0, 0, 1, 1).data;

        return {
          radius: style.borderRadius,
          border: style.borderTopWidth,
          borderStyle: style.borderTopStyle,
          shadow: style.boxShadow,
          shadowGeometry: layer?.groups?.geometry ?? null,
          shadowRgb: { r, g, b },
        };
      });

      expect(frame.radius, theme).toBe("0px");
      expect(frame.border, theme).toBe("2px");
      expect(frame.borderStyle, theme).toBe("solid");

      // A solid, offset shadow: a 4px offset on each axis, no blur, no spread.
      expect(frame.shadowGeometry, `${theme}: ${frame.shadow}`).toBe(
        "4px 4px 0px 0px",
      );
      expect(
        rgbDistance(frame.shadowRgb, hexToRgb(HARD_SHADOW[theme])),
        `${theme}: ${frame.shadow}`,
      ).toBeLessThan(SAME_COLOUR);

      // Nothing inside the frame is rounded either — the theme button was the
      // one control that said `rounded-full` by class rather than by token.
      const radii = await dockControls(page).evaluateAll((nodes) =>
        nodes.map((node) => getComputedStyle(node).borderRadius),
      );

      expect(radii, theme).toHaveLength(4);
      expect(radii, theme).toEqual(["0px", "0px", "0px", "0px"]);
    }
  });

  test("gives every control a 44px target, at least 8px from the next one", async ({
    page,
  }) => {
    await page.goto(ROUTES.HOME);

    const controls = dockControls(page);

    await expect(controls).toHaveCount(4);

    const boxes = await controls.evaluateAll((nodes) =>
      nodes.map((node) => {
        const { x, width, height } = node.getBoundingClientRect();
        return { x, width, height };
      }),
    );

    for (const [index, box] of boxes.entries()) {
      expect(box.width, `control ${index} width`).toBeGreaterThanOrEqual(
        MIN_TARGET,
      );
      expect(box.height, `control ${index} height`).toBeGreaterThanOrEqual(
        MIN_TARGET,
      );
    }

    for (let index = 1; index < boxes.length; index += 1) {
      const previous = boxes[index - 1];
      const current = boxes[index];

      if (!previous || !current) throw new Error("missing box");

      expect(
        current.x - (previous.x + previous.width),
        `gap before control ${index}`,
      ).toBeGreaterThanOrEqual(MIN_GAP);
    }
  });

  test("does not grow a control under the pointer", async ({ page }) => {
    await page.goto(ROUTES.HOME);

    const github = page.getByRole("navigation").getByRole("link", {
      name: "GitHub",
    });
    // The v1 magnification grew a *wrapper* around each control, so the
    // control itself kept its size and only its neighbours moved. Measuring
    // the one under the pointer and the one beside it catches both shapes.
    const linkedin = page.getByRole("navigation").getByRole("link", {
      name: "LinkedIn",
    });
    const before = await github.boundingBox();
    const neighbourBefore = await linkedin.boundingBox();

    expect(before).not.toBeNull();
    expect(neighbourBefore).not.toBeNull();

    await github.hover();
    // Give a spring, if one had survived, its time to settle: the v1 one
    // reached its 60px peak well inside this.
    await page.waitForTimeout(400);

    expect(await github.boundingBox()).toEqual(before);
    expect(await linkedin.boundingBox()).toEqual(neighbourBefore);
  });
});
