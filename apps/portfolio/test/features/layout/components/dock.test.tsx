import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import Dock from "~/features/layout/components/dock";
import { render } from "../../../support/render";

const dockSource = readFileSync(
  resolve(__dirname, "../../../../src/features/layout/components/dock.tsx"),
  "utf8",
);

/**
 * The v1 dock was the macOS bar: every icon's width was a spring driven by the
 * pointer's distance from it. The redesign keeps the bar and the four items and
 * takes the swelling out — hover changes a background colour and nothing else.
 * What can regress is the swelling coming back through a copied snippet, and
 * it would come back as an inline `width` written by `motion` on every pointer
 * move, which is the one thing a jsdom render can see.
 */
describe("Dock", () => {
  it("leaves a control its own size while the pointer travels along the bar", () => {
    render(
      <Dock>
        <button type="button">one</button>
        <button type="button">two</button>
      </Dock>,
    );

    const bar = screen.getByRole("navigation");
    const control = screen.getByRole("button", { name: "one" });

    fireEvent.mouseMove(bar, { pageX: 12 });
    fireEvent.mouseMove(bar, { pageX: 48 });

    // No pointer-driven style at all: a size written here would be the
    // magnification, whatever it was called.
    expect(control).not.toHaveAttribute("style");
    fireEvent.mouseLeave(bar);
    expect(control).not.toHaveAttribute("style");
  });

  it("has no pointer-tracking motion left in it", () => {
    // Read as text, because a spring that happens to rest at its start value
    // renders the same as no spring — the absence has to be asserted on the
    // source. `motion` is still a dependency of the app: the work rows fold
    // with it. It just has nothing to do in the dock any more.
    expect(dockSource).not.toContain("motion/react");
    expect(dockSource).not.toMatch(/useSpring|useMotionValue|magnification/);
  });
});
