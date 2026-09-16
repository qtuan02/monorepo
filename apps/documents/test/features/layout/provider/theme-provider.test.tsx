import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  THEME_STORAGE_KEY,
  ThemeProvider,
  useTheme,
} from "~/features/layout/provider/theme-provider";

function Probe() {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <button type="button" onClick={() => setTheme("dark")}>
      {resolvedTheme}
    </button>
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
 * The three decisions the provider makes: which theme to open in, what a
 * switch writes, and where the class lands. The look of each theme is CSS
 * (`test/globals.test.ts`); the E2E spec proves the class survives a reload.
 */
describe("ThemeProvider", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove("dark");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("opens in the system theme when nothing is stored", () => {
    stubSystemTheme(true);

    render(
      <ThemeProvider>
        <Probe />
      </ThemeProvider>,
    );

    expect(screen.getByRole("button")).toHaveTextContent("dark");
    expect(document.documentElement).toHaveClass("dark");
  });

  it("prefers the stored choice over the system theme", () => {
    stubSystemTheme(true);
    localStorage.setItem(THEME_STORAGE_KEY, "light");

    render(
      <ThemeProvider>
        <Probe />
      </ThemeProvider>,
    );

    expect(screen.getByRole("button")).toHaveTextContent("light");
    expect(document.documentElement).not.toHaveClass("dark");
  });

  it("stamps the class on <html> and remembers a switch", async () => {
    stubSystemTheme(false);
    const user = userEvent.setup();

    render(
      <ThemeProvider>
        <Probe />
      </ThemeProvider>,
    );

    expect(document.documentElement).not.toHaveClass("dark");

    await act(() => user.click(screen.getByRole("button")));

    expect(document.documentElement).toHaveClass("dark");
    expect(document.documentElement.style.colorScheme).toBe("dark");
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("dark");
  });

  it("throws when read outside the provider, rather than answering light", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});

    expect(() => render(<Probe />)).toThrow(/ThemeProvider/);
  });
});
