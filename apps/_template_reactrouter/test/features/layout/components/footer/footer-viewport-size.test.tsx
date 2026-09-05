import { act, render, screen } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import FooterViewportSize, {
  getViewportLabel,
} from "~/features/layout/components/footer/footer-viewport-size";

function resizeTo(width: number, height: number) {
  window.innerWidth = width;
  window.innerHeight = height;
  act(() => {
    window.dispatchEvent(new Event("resize"));
  });
}

describe("FooterViewportSize", () => {
  it("renders nothing on the server", () => {
    // Not a cosmetic difference from the Vite Template's version: there is no
    // `window` during a server render, so reading `innerWidth` in the state
    // initializer would throw and take the whole document response with it.
    expect(renderToString(<FooterViewportSize />)).toBe("");
  });

  it("reads the window once it has mounted", () => {
    render(<FooterViewportSize />);

    // jsdom's default viewport.
    expect(screen.getByText("Window 1024×768")).toBeInTheDocument();
  });

  it("follows a resize", () => {
    render(<FooterViewportSize />);

    resizeTo(500, 900);

    expect(screen.getByText("Mobile 500×900")).toBeInTheDocument();
  });
});

describe("getViewportLabel", () => {
  // The cut-offs are Tailwind's own `sm` and `lg`, so the label names the band
  // the styles branch on — each boundary is asserted on both sides of itself.
  it.each([
    [639, "Mobile"],
    [640, "Tablet"],
    [1023, "Tablet"],
    [1024, "Window"],
  ])("calls %ipx %s", (width, label) => {
    expect(getViewportLabel(width)).toBe(label);
  });
});
