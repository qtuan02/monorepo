// Derived from hooks-ts useThrottle.test.ts @ 9bd12431bb24b84d211f0d735c6bef79fe1be85a (hooks-ts@0.12.0), MIT © 2024 Michał Worwąg — see LICENSE-hooks-ts
// patched: rewritten against the real throttle — upstream assigns `result.current` directly instead of
// rerendering, and even rerendered it proves nothing since its body is a debounce (see use-throttle.ts).
// Run this file against the unpatched (debounce) body and "updates at most once per delay, with a leading
// edge" fails: v1 never appears, only v5 does, ~500ms later than this test expects it.
import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useThrottle } from "../src/use-throttle";

describe("useThrottle", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("updates at most once per delay, with a leading edge and a trailing edge", () => {
    const delay = 500;
    const { result, rerender } = renderHook(
      ({ value }) => useThrottle(value, delay),
      { initialProps: { value: "v0" } },
    );

    expect(result.current).toBe("v0");

    // The first change arrives with no window open — it applies immediately
    // (leading), unlike a debounce, which would wait out the full delay.
    act(() => {
      rerender({ value: "v1" });
    });
    expect(result.current).toBe("v1");

    // Four more changes inside the same 100ms burst, all inside the window
    // the leading update just opened — none of them should update the value.
    act(() => {
      vi.advanceTimersByTime(20);
      rerender({ value: "v2" });
      vi.advanceTimersByTime(20);
      rerender({ value: "v3" });
      vi.advanceTimersByTime(20);
      rerender({ value: "v4" });
      vi.advanceTimersByTime(20);
      rerender({ value: "v5" });
    });
    expect(result.current).toBe("v1");

    // Once the window closes, the trailing update carries the LAST value
    // seen — v5, not v2/v3/v4. Exactly two values were ever observed after
    // the initial one: v1 (leading) and v5 (trailing).
    act(() => {
      vi.advanceTimersByTime(delay - 80);
    });
    expect(result.current).toBe("v5");
  });
});
