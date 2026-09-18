import { act, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

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

afterEach(() => {
  document.documentElement.classList.remove("dark", "light");
  document.documentElement.style.colorScheme = "";
  localStorage.removeItem(THEME_STORAGE_KEY);
});

/**
 * Two decisions, both invisible in a snapshot: the init script is in the tree
 * for the first mount only — a later mount (the root layout remounting on a
 * language switch) must not create a `<script>` on the client, which is the
 * warning `next-themes` used to raise — and setting the theme writes the
 * class, the colour scheme and the stored value together.
 */
describe("ThemeProvider", () => {
  it("renders the init script once, on the first mount of the document", () => {
    const first = render(
      <ThemeProvider>
        <Probe />
      </ThemeProvider>,
    );
    expect(first.container.querySelector("script")).not.toBeNull();
    first.unmount();

    const second = render(
      <ThemeProvider>
        <Probe />
      </ThemeProvider>,
    );
    expect(second.container.querySelector("script")).toBeNull();
  });

  it("applies a theme to <html> and remembers it", () => {
    render(
      <ThemeProvider>
        <Probe />
      </ThemeProvider>,
    );

    act(() => screen.getByRole("button").click());

    expect(screen.getByRole("button")).toHaveTextContent("dark");
    expect(document.documentElement).toHaveClass("dark");
    expect(document.documentElement.style.colorScheme).toBe("dark");
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("dark");
  });
});
