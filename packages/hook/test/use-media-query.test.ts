import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { useMediaQuery } from "../src/use-media-query";
import { installMatchMedia } from "./support/match-media-mock";

const QUERY = "(min-width: 1024px)";

describe("useMediaQuery", () => {
  let media: ReturnType<typeof installMatchMedia>;

  beforeEach(() => {
    media = installMatchMedia();
  });

  it("is false on the first render and takes the real value in the effect", () => {
    // Deliberately NOT read in the initializer (spec #144, patch group 1): the
    // server has no `matchMedia`, so a lazy read there would hydrate mismatched.
    media.setMatches(QUERY, true);
    const renders: boolean[] = [];
    const { result } = renderHook(() => {
      const matches = useMediaQuery(QUERY);
      renders.push(matches);
      return matches;
    });

    expect(renders[0]).toBe(false);
    expect(result.current).toBe(true);
  });

  it("follows the change event", () => {
    const { result } = renderHook(() => useMediaQuery(QUERY));
    expect(result.current).toBe(false);

    act(() => {
      media.setMatches(QUERY, true);
    });
    expect(result.current).toBe(true);

    act(() => {
      media.setMatches(QUERY, false);
    });
    expect(result.current).toBe(false);
  });
});
