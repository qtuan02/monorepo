// Derived from hooks-ts useNetworkStatus.test.ts @ 9bd12431bb24b84d211f0d735c6bef79fe1be85a (hooks-ts@0.12.0), MIT © 2024 Michał Worwąg — see LICENSE-hooks-ts
// patched: upstream only asserts the default `true` — the bug this hook fixes
// (a browser always initializing `true` instead of reading `navigator.onLine`)
// would still pass it. Rewritten to set `navigator.onLine` before render and
// assert the `online`/`offline` window events.
import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { useNetworkStatus } from "../src/use-network-status";

function setOnLine(value: boolean) {
  Object.defineProperty(window.navigator, "onLine", {
    value,
    configurable: true,
  });
}

describe("useNetworkStatus", () => {
  afterEach(() => {
    setOnLine(true);
  });

  it("reads navigator.onLine on the first render", () => {
    setOnLine(false);

    const { result } = renderHook(() => useNetworkStatus());

    expect(result.current).toBe(false);
  });

  it("defaults to true when the browser reports online", () => {
    setOnLine(true);

    const { result } = renderHook(() => useNetworkStatus());

    expect(result.current).toBe(true);
  });

  it("flips to false on an offline event, and back on online", () => {
    setOnLine(true);
    const { result } = renderHook(() => useNetworkStatus());

    act(() => window.dispatchEvent(new Event("offline")));
    expect(result.current).toBe(false);

    act(() => window.dispatchEvent(new Event("online")));
    expect(result.current).toBe(true);
  });
});
