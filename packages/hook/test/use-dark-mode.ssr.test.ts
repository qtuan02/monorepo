// @vitest-environment node
//
// Same shape as `use-local-storage.ssr.test.ts` — no `window`, no jsdom's
// `matchMedia`/`localStorage` either, since `useDarkMode` composes both.
import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { useDarkMode } from "../src/use-dark-mode";

function Probe({ onValue }: { onValue: (value: boolean) => void }) {
  const [isDarkMode] = useDarkMode();
  onValue(isDarkMode);
  return null;
}

describe("useDarkMode — SSR", () => {
  it("returns false with no window, and calls no console.error", () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    let value: boolean | undefined;

    renderToString(
      createElement(Probe, {
        onValue: (v) => {
          value = v;
        },
      }),
    );

    expect(value).toBe(false);
    expect(consoleError).not.toHaveBeenCalled();
  });
});
