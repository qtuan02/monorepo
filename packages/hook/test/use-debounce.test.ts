// Derived from hooks-ts useDebounce.test.ts @ 9bd12431bb24b84d211f0d735c6bef79fe1be85a (hooks-ts@0.12.0), MIT © 2024 Michał Worwąg — see LICENSE-hooks-ts
// patched: drive the value through `rerender` props — upstream assigns `result.current` directly, which asserts nothing
import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useDebounce } from "../src/use-debounce";

describe("useDebounce", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should debounce the value", () => {
    const delay = 100;
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, delay),
      { initialProps: { value: "Hello World" } },
    );

    expect(result.current).toBe("Hello World");

    // Update the value but the debounced value should not change
    rerender({ value: "new value" });

    expect(result.current).toBe("Hello World");

    // Change timers by more than delay
    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(result.current).toBe("new value");
  });
});
