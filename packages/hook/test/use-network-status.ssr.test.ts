// @vitest-environment node
//
// Same shape as `use-local-storage.ssr.test.ts`: `renderToString` with no
// `window` at all, proving the corrected `isServer` check rather than
// assuming it.
import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { useNetworkStatus } from "../src/use-network-status";

function Probe({ onValue }: { onValue: (value: boolean) => void }) {
  const isOnline = useNetworkStatus();
  onValue(isOnline);
  return null;
}

describe("useNetworkStatus — SSR", () => {
  it("returns true with no window, and does not throw", () => {
    let value: boolean | undefined;

    renderToString(
      createElement(Probe, {
        onValue: (v) => {
          value = v;
        },
      }),
    );

    expect(value).toBe(true);
  });
});
