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
 * Three decisions: which preference to open in, what a switch persists, and
 * — the one thing this provider does that `apps/documents`' doesn't —
 * capping every resolution to "light" while Islands' `.dark` isn't built
 * (ADR-0016 §4). The look of each theme is CSS (`test/globals.test.ts`).
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

  it("stays light even when the system prefers dark — Dark is locked", () => {
    stubSystemTheme(true);

    render(
      <ThemeProvider>
        <Probe />
      </ThemeProvider>,
    );

    expect(screen.getByTestId("resolved")).toHaveTextContent("light");
    expect(document.documentElement).not.toHaveClass("dark");
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

  it("persists a preference and keeps the resolved theme capped to light", async () => {
    const user = userEvent.setup();

    render(
      <ThemeProvider>
        <Probe />
      </ThemeProvider>,
    );

    await act(() =>
      user.click(screen.getByRole("button", { name: "set dark" })),
    );

    // The raw choice is remembered — so it "just works" the day Dark unlocks —
    // but nothing paints dark yet.
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("dark");
    expect(screen.getByTestId("preference")).toHaveTextContent("dark");
    expect(screen.getByTestId("resolved")).toHaveTextContent("light");
    expect(document.documentElement).not.toHaveClass("dark");
  });

  it("throws when read outside the provider, rather than answering light", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});

    expect(() => render(<Probe />)).toThrow(/ThemeProvider/);
  });
});
