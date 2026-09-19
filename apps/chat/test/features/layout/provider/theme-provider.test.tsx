import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  THEME_STORAGE_KEY,
  ThemeProvider,
  useTheme,
} from "~/features/layout/provider/theme-provider";

function Probe() {
  const { preference, resolvedTheme, setPreference } = useTheme();

  return (
    <>
      <span data-testid="resolved">{resolvedTheme}</span>
      <span data-testid="preference">{preference}</span>
      <button type="button" onClick={() => setPreference("dark")}>
        set dark
      </button>
      <button type="button" onClick={() => setPreference("system")}>
        set system
      </button>
    </>
  );
}

/** What `prefers-color-scheme: dark` answers — the vitest setup stub says no. */
function stubSystemTheme(dark: boolean) {
  vi.spyOn(window, "matchMedia").mockImplementation(
    (query) =>
      ({
        matches: dark && query.includes("dark"),
        media: query,
        addEventListener: () => {},
        removeEventListener: () => {},
      }) as unknown as MediaQueryList,
  );
}

/**
 * Two decisions: which preference to open in, and what a switch persists
 * and resolves to — including "system" following the OS both ways, now
 * that Islands' `.dark` is built (ADR-0016 §4). The look of each theme is
 * CSS (`test/globals.test.ts`).
 */
describe("ThemeProvider", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove("dark");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("opens on System by default, resolved to light", () => {
    render(
      <ThemeProvider>
        <Probe />
      </ThemeProvider>,
    );

    expect(screen.getByTestId("preference")).toHaveTextContent("system");
    expect(screen.getByTestId("resolved")).toHaveTextContent("light");
    expect(document.documentElement).not.toHaveClass("dark");
  });

  it("resolves System to dark when the OS prefers dark", () => {
    stubSystemTheme(true);

    render(
      <ThemeProvider>
        <Probe />
      </ThemeProvider>,
    );

    expect(screen.getByTestId("resolved")).toHaveTextContent("dark");
    expect(document.documentElement).toHaveClass("dark");
  });

  it("reads the stored preference back on mount", () => {
    localStorage.setItem(THEME_STORAGE_KEY, "system");

    render(
      <ThemeProvider>
        <Probe />
      </ThemeProvider>,
    );

    expect(screen.getByTestId("preference")).toHaveTextContent("system");
  });

  it("persists a preference and resolves it", async () => {
    const user = userEvent.setup();

    render(
      <ThemeProvider>
        <Probe />
      </ThemeProvider>,
    );

    await act(() =>
      user.click(screen.getByRole("button", { name: "set dark" })),
    );

    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("dark");
    expect(screen.getByTestId("preference")).toHaveTextContent("dark");
    expect(screen.getByTestId("resolved")).toHaveTextContent("dark");
    expect(document.documentElement).toHaveClass("dark");
  });

  it("throws when read outside the provider, rather than answering light", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});

    expect(() => render(<Probe />)).toThrow(/ThemeProvider/);
  });
});
