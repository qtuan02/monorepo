// @vitest-environment node
//
// `renderToString` is the real server-render entry point — no jsdom, no
// `window` at all — so this is where the initializer's SSR guard is actually
// proven rather than assumed. `@testing-library/react`'s `renderHook` needs a
// DOM container and cannot run in this environment.
import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { useLocalStorage } from "../src/use-local-storage";

function Probe({ onValue }: { onValue: (value: string) => void }) {
  const [value] = useLocalStorage("key", "fallback");
  onValue(value);
  return null;
}

describe("useLocalStorage — SSR", () => {
  it("returns initialValue with no window, and calls no console.error", () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    let value: string | undefined;

    renderToString(
      createElement(Probe, {
        onValue: (v) => {
          value = v;
        },
      }),
    );

    expect(value).toBe("fallback");
    expect(consoleError).not.toHaveBeenCalled();
  });
});
