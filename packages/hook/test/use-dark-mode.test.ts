// Derived from hooks-ts useDarkMode.test.ts @ 9bd12431bb24b84d211f0d735c6bef79fe1be85a (hooks-ts@0.12.0), MIT © 2024 Michał Worwąg — see LICENSE-hooks-ts
// patched: upstream's default-preference and toggle cases carry over; the
// options (custom `className`/`target`/`storageKey`) and the unmount cleanup
// are new — the shape neither upstream test nor its `[isDarkMode, setValue]`
// return (see the `useDarkMode.md` doc drift noted in the research) covers.
import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { useDarkMode } from "../src/use-dark-mode";
import { installMatchMedia } from "./support/match-media-mock";
import { localStorageMock } from "./support/storage-mock";

const DARK_QUERY = "(prefers-color-scheme: dark)";

describe("useDarkMode", () => {
  let media: ReturnType<typeof installMatchMedia>;

  beforeEach(() => {
    Object.defineProperty(window, "localStorage", {
      value: localStorageMock,
      configurable: true,
    });
    localStorageMock.clear();
    document.body.className = "";
    document.documentElement.className = "";
    media = installMatchMedia();
  });

  it("initializes from the system preference when nothing is saved", () => {
    media.setMatches(DARK_QUERY, true);

    const { result } = renderHook(() => useDarkMode());

    expect(result.current[0]).toBe(true);
  });

  it("initializes from the saved value over the system preference", () => {
    localStorageMock.setItem("darkMode", "false");
    media.setMatches(DARK_QUERY, true);

    const { result } = renderHook(() => useDarkMode());

    expect(result.current[0]).toBe(false);
  });

  it("toggles, persists to localStorage, and sets the class on document.body by default", () => {
    const { result } = renderHook(() => useDarkMode());
    expect(document.body.classList.contains("dark-mode")).toBe(false);

    act(() => result.current[1]());

    expect(result.current[0]).toBe(true);
    expect(localStorageMock.getItem("darkMode")).toBe("true");
    expect(document.body.classList.contains("dark-mode")).toBe(true);
  });

  it("honours a custom className, target and storageKey", () => {
    const { result } = renderHook(() =>
      useDarkMode({
        className: "dark",
        target: document.documentElement,
        storageKey: "theme-dark",
      }),
    );

    act(() => result.current[1]());

    expect(localStorageMock.getItem("theme-dark")).toBe("true");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(document.body.classList.contains("dark")).toBe(false);
  });

  it("removes its class on unmount", () => {
    const { result, unmount } = renderHook(() => useDarkMode());
    act(() => result.current[1]());
    expect(document.body.classList.contains("dark-mode")).toBe(true);

    unmount();

    expect(document.body.classList.contains("dark-mode")).toBe(false);
  });
});
