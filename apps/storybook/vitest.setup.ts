import "@testing-library/jest-dom/vitest";

import { setProjectAnnotations } from "@storybook/react-vite";
import { cleanup } from "@testing-library/react";
import { afterEach, beforeAll } from "vitest";

import * as previewAnnotations from "./.storybook/preview";

// Portable stories render through the same decorators the Storybook UI applies,
// so a story that only works because of the TooltipProvider/Toaster wrapper in
// preview.tsx behaves here exactly as a reviewer sees it.
const annotations = setProjectAnnotations([previewAnnotations]);

beforeAll(annotations.beforeAll);

// Only `cleanup` here: Vitest 5 clears mock history before each test on its own
// (`clearMocks` now defaults to true, and vitest.config.ts states it), so a
// `vi.clearAllMocks()` in this hook would be a second spelling of a guarantee the
// runner already makes.
afterEach(() => {
  cleanup();
});

// jsdom implements no layout engine and none of the pointer-capture API, both of
// which Base UI's positioning and dismiss logic call unconditionally. Without
// these, an overlay throws on open for a reason that has nothing to do with the
// component under test.
/**
 * A made-up but non-zero box for anything that asks how big it is. jsdom lays
 * nothing out, so every real measurement here is 0 — and Recharts' own
 * `ResponsiveContainer` refuses to draw a chart at 0×0 and says so on stderr.
 * The numbers only have to be positive; nothing asserts on them.
 */
const STUB_CONTENT_BOX = { inlineSize: 640, blockSize: 320 };

class ResizeObserverStub {
  #callback: ResizeObserverCallback;

  constructor(callback: ResizeObserverCallback) {
    this.#callback = callback;
  }

  // Reporting the box straight back is what makes this a stub rather than a
  // no-op. `observe` is called from an effect, which RTL already runs inside
  // act, so a synchronous callback settles in the same commit instead of
  // arriving loose after the story has rendered.
  observe(target: Element) {
    const { inlineSize, blockSize } = STUB_CONTENT_BOX;
    const contentRect = {
      x: 0,
      y: 0,
      top: 0,
      left: 0,
      right: inlineSize,
      bottom: blockSize,
      width: inlineSize,
      height: blockSize,
      toJSON: () => ({}),
    };

    this.#callback(
      [
        {
          target,
          contentRect,
          borderBoxSize: [STUB_CONTENT_BOX],
          contentBoxSize: [STUB_CONTENT_BOX],
          devicePixelContentBoxSize: [STUB_CONTENT_BOX],
        } as unknown as ResizeObserverEntry,
      ],
      this as unknown as ResizeObserver,
    );
  }

  unobserve() {}
  disconnect() {}
}

class IntersectionObserverStub {
  readonly root = null;
  readonly rootMargin = "";
  readonly thresholds: readonly number[] = [];
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
}

globalThis.ResizeObserver ??= ResizeObserverStub as never;
globalThis.IntersectionObserver ??= IntersectionObserverStub as never;

globalThis.matchMedia ??= ((query: string) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: () => {},
  removeListener: () => {},
  addEventListener: () => {},
  removeEventListener: () => {},
  dispatchEvent: () => false,
})) as never;

Element.prototype.scrollIntoView ??= () => {};
Element.prototype.getAnimations ??= () => [];
Element.prototype.hasPointerCapture ??= () => false;
Element.prototype.setPointerCapture ??= () => {};
Element.prototype.releasePointerCapture ??= () => {};
