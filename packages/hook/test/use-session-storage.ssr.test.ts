// @vitest-environment node
//
// Same reasoning as `use-local-storage.ssr.test.ts`: `renderToString` runs
// with no `window`, so it is where the SSR guard in the initializer is
// actually exercised rather than assumed.
import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { useSessionStorage } from "../src/use-session-storage";

function Probe({ onValue }: { onValue: (value: string) => void }) {
  const [value] = useSessionStorage("key", "fallback");
  onValue(value);
  return null;
}

describe("useSessionStorage — SSR", () => {
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
