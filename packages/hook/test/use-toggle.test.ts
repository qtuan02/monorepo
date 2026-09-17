// Derived from hooks-ts useToggle.test.ts @ 9bd12431bb24b84d211f0d735c6bef79fe1be85a (hooks-ts@0.12.0), MIT © 2024 Michał Worwąg — see LICENSE-hooks-ts
import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useToggle } from "../src/use-toggle";

describe("useToggle", () => {
  it("should initialize with the default value", () => {
    const { result } = renderHook(() => useToggle());
    expect(result.current[0]).toBe(false);
  });

  it("should initialize with the provided initial value", () => {
    const { result } = renderHook(() => useToggle(true));
    expect(result.current[0]).toBe(true);
  });

  it("should toggle the state when called without arguments", () => {
    const { result } = renderHook(() => useToggle(false));
    const [, toggle] = result.current;

    act(() => toggle());
    expect(result.current[0]).toBe(true);

    act(() => toggle());
    expect(result.current[0]).toBe(false);
  });

  it("should set the state explicitly when called with a value", () => {
    const { result } = renderHook(() => useToggle(false));
    const [, toggle] = result.current;

    act(() => toggle(true));
    expect(result.current[0]).toBe(true);

    act(() => toggle(false));
    expect(result.current[0]).toBe(false);
  });
});
