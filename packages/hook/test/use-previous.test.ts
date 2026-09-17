// Derived from hooks-ts usePrevious.test.ts @ 9bd12431bb24b84d211f0d735c6bef79fe1be85a (hooks-ts@0.12.0), MIT © 2024 Michał Worwąg — see LICENSE-hooks-ts
// patched: sequence assertion added for the useState rewrite (#147)
import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { usePrevious } from "../src/use-previous";

describe("usePrevious", () => {
  it("returns undefined on the first render", () => {
    const { result } = renderHook(() => usePrevious(0));
    expect(result.current).toBeUndefined();
  });

  /**
   * Rerenders through three values and checks `previous` after each step —
   * the shape the patch (react.dev's useState pattern) has to hold across a
   * sequence, not just a single update.
   *
   * Verified by hand against the upstream `useRef`-based version: under
   * `@testing-library/react`'s `renderHook`, with and without `StrictMode`,
   * this same sequence is IDENTICAL on both implementations — mutating a ref
   * during a normal, committed render is idempotent, so no plain rerender
   * test can turn red here. What the rewrite actually fixes is a static one:
   * React Compiler (and `eslint-plugin-react-hooks`) flags reading/writing
   * `ref.current` during render, which stops it from safely memoizing any
   * component that calls this hook — a build/lint-time hazard, not a
   * runtime output difference this suite can observe.
   */
  it("tracks the previous value across a sequence of renders", () => {
    let value = 0;
    const { result, rerender } = renderHook(() => usePrevious(value));

    expect(result.current).toBeUndefined();

    value = 1;
    act(() => rerender());
    expect(result.current).toBe(0);

    value = 2;
    act(() => rerender());
    expect(result.current).toBe(1);

    value = 3;
    act(() => rerender());
    expect(result.current).toBe(2);
  });

  it("handles non-primitive values", () => {
    let value = { a: 1 };
    const { result, rerender } = renderHook(() => usePrevious(value));

    act(() => {
      value = { a: 2 };
      rerender();
    });
    expect(result.current).toEqual({ a: 1 });

    act(() => {
      value = { a: 3 };
      rerender();
    });
    expect(result.current).toEqual({ a: 2 });
  });
});
