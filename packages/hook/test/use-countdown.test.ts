// Derived from hooks-ts useCountdown.test.ts @ 9bd12431bb24b84d211f0d735c6bef79fe1be85a (hooks-ts@0.12.0), MIT © 2024 Michał Worwąg — see LICENSE-hooks-ts
import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useCountdown } from "../src/use-countdown";

describe("useCountdown", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should initialize with the given initial seconds", () => {
    const { result } = renderHook(() => useCountdown(10));
    expect(result.current[0]).toBe(10);
  });

  it("should decrement the countdown every second", () => {
    const { result } = renderHook(() => useCountdown(5));

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current[0]).toBe(4);

    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(result.current[0]).toBe(1);
  });

  it("should reset the countdown to the initial value", () => {
    const { result } = renderHook(() => useCountdown(10));
    const [, reset] = result.current;

    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(result.current[0]).toBe(5);

    act(() => {
      reset();
    });
    expect(result.current[0]).toBe(10);
  });
});
