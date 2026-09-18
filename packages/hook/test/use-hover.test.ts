// Derived from hooks-ts useHover.test.ts @ 9bd12431bb24b84d211f0d735c6bef79fe1be85a (hooks-ts@0.12.0), MIT © 2024 Michał Worwąg — see LICENSE-hooks-ts
import { act, fireEvent, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useHover } from "../src/use-hover";

describe("useHover", () => {
  const element = {
    current: document.createElement("div"),
  };

  it("should return ref and initial hover state as false", () => {
    const { result } = renderHook(() => useHover(element));

    const isHovered = result.current;
    expect(isHovered).toBe(false);
  });

  it("should set hover state to true on mouseenter", () => {
    const { result } = renderHook(() => useHover(element));

    expect(result.current).toBe(false);

    act(() => void fireEvent.mouseEnter(element.current));
    expect(result.current).toBe(true);
  });

  it("should set hover state back to false on mouseleave", () => {
    const { result } = renderHook(() => useHover(element));

    expect(result.current).toBe(false);

    act(() => void fireEvent.mouseEnter(element.current));
    expect(result.current).toBe(true);

    act(() => void fireEvent.mouseLeave(element.current));
    expect(result.current).toBe(false);
  });
});
