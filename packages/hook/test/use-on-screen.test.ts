import type { RefObject } from "react";
import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { useOnScreen } from "../src/use-on-screen";
import { installIntersectionObserver } from "./support/intersection-observer-mock";

describe("useOnScreen", () => {
  let observer: ReturnType<typeof installIntersectionObserver>;
  let ref: RefObject<Element | null>;

  beforeEach(() => {
    observer = installIntersectionObserver();
    ref = { current: document.createElement("div") };
  });

  it("is false until the observer reports an intersection", () => {
    const { result } = renderHook(() => useOnScreen(ref));

    expect(result.current).toBe(false);

    act(() => {
      observer.triggerIntersecting(true);
    });

    expect(result.current).toBe(true);
  });

  it("unobserves the element on unmount", () => {
    const { unmount } = renderHook(() => useOnScreen(ref));

    expect(observer.observe).toHaveBeenCalledWith(ref.current);

    unmount();

    expect(observer.unobserve).toHaveBeenCalledWith(ref.current);
  });
});
