import { afterEach, describe, expect, it, vi } from "vitest";

import BlurFade from "~/features/home/components/blur-fade";
import BlurFadeText from "~/features/home/components/blur-fade-text";
import { render } from "../../../support/render";

/**
 * Every section of the page arrives through one of these two, so whether they
 * respect `prefers-reduced-motion` decides it for the whole site.
 *
 * Getting it wrong is not a matter of taste for the reader who set that
 * preference: an entrance animation is exactly the vestibular trigger the
 * setting exists to switch off, and the content starting at `opacity: 0` means
 * a page that animates is also a page that is briefly not there.
 */
function stubReducedMotion(prefersReduce: boolean) {
  vi.stubGlobal(
    "matchMedia",
    vi.fn((query: string) => ({
      matches: prefersReduce && query.includes("prefers-reduced-motion"),
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  );
}

describe("BlurFade under prefers-reduced-motion", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders its children at rest, with nothing to animate away from", () => {
    stubReducedMotion(true);

    const { container } = render(
      <BlurFade delay={0.5}>
        <p>Nội dung</p>
      </BlurFade>,
    );

    const root = container.querySelector('[data-slot="blur-fade"]');

    expect(root).not.toBeNull();
    // The failure this guards is the loud one: a reader who asked for no
    // motion getting a page that starts invisible and stays that way if the
    // animation never runs.
    // No inline style at all: not a zero-length animation, not a tree that
    // starts transparent and is corrected a frame later.
    expect(root?.getAttribute("style")).toBeNull();
    expect(root).toHaveTextContent("Nội dung");
  });

  it("does the same for the heading twin", () => {
    stubReducedMotion(true);

    const { container } = render(<BlurFadeText as="h1" text="Xin chào" />);

    const root = container.querySelector('[data-slot="blur-fade-text"]');

    expect(root?.getAttribute("style")).toBeNull();
    expect(root?.tagName).toBe("H1");
  });
});

/*
 * There is deliberately no "and it still animates otherwise" case here.
 * Motion resolves the media query once per module and caches it, so a second
 * `matchMedia` stub in the same file is ignored — a test asserting the
 * animating branch would pass or fail on the order the cases happen to run in,
 * which is worse than not having it. The animating branch is what every other
 * test in this suite already renders.
 */
