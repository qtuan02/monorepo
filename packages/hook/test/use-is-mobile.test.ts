import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { MOBILE_BREAKPOINT, useIsMobile } from "../src/use-is-mobile";
import { installMatchMedia } from "./support/match-media-mock";

// The query the hook derives from the breakpoint — pinned so a change on
// either side (an off-by-one on `md`, a `min-width` flip) fails by name.
const QUERY = `(max-width: ${MOBILE_BREAKPOINT - 1}px)`;

describe("useIsMobile", () => {
  let media: ReturnType<typeof installMatchMedia>;

  beforeEach(() => {
    media = installMatchMedia();
  });

  it("asks matchMedia for the width just below Tailwind md", () => {
    renderHook(() => useIsMobile());
    expect(window.matchMedia).toHaveBeenCalledWith("(max-width: 767px)");
  });

  it("is desktop on the first render even on a phone, then true after the effect", () => {
    media.setMatches(QUERY, true);
    const renders: boolean[] = [];
    const { result } = renderHook(() => {
      const isMobile = useIsMobile();
      renders.push(isMobile);
      return isMobile;
    });

    expect(renders[0]).toBe(false);
    expect(result.current).toBe(true);
  });

  it("follows the viewport", () => {
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);

    act(() => {
      media.setMatches(QUERY, true);
    });
    expect(result.current).toBe(true);
  });
});
