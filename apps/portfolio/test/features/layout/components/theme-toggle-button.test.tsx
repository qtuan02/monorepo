import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import ThemeToggleButton from "~/features/layout/components/theme-toggle-button";
import { render } from "../../../support/render";

const setTheme = vi.fn();
const useThemeMock = vi.fn(() => ({ resolvedTheme: "light", setTheme }));

/**
 * `next-themes` is the external system this button syncs to — the same kind of
 * seam an HTTP service singleton is, and the only thing worth faking here. The
 * assertions are about what the handler *decides*: which theme comes next, and
 * which direction the CSS wipe runs.
 */
vi.mock("next-themes", () => ({
  useTheme: () => useThemeMock(),
}));

beforeEach(() => {
  useThemeMock.mockReturnValue({ resolvedTheme: "light", setTheme });
});

afterEach(() => {
  delete document.documentElement.dataset.themeTransition;
  // `startViewTransition` is absent from jsdom, so a test that adds it has to
  // take it back off — the fallback branch depends on it being missing.
  Reflect.deleteProperty(document, "startViewTransition");
});

describe("ThemeToggleButton", () => {
  it("switches to dark from light and points the wipe that way", async () => {
    const user = userEvent.setup();

    render(<ThemeToggleButton label="Đổi giao diện sáng tối" />);

    await user.click(
      screen.getByRole("button", { name: "Đổi giao diện sáng tối" }),
    );

    expect(setTheme).toHaveBeenCalledWith("dark");
    expect(document.documentElement.dataset.themeTransition).toBe("to-dark");
  });

  it("switches back to light from dark", async () => {
    const user = userEvent.setup();
    useThemeMock.mockReturnValue({ resolvedTheme: "dark", setTheme });

    render(<ThemeToggleButton label="Đổi giao diện sáng tối" />);

    await user.click(
      screen.getByRole("button", { name: "Đổi giao diện sáng tối" }),
    );

    expect(setTheme).toHaveBeenCalledWith("light");
    expect(document.documentElement.dataset.themeTransition).toBe("to-light");
  });

  it("still switches where the View Transition API is missing", async () => {
    const user = userEvent.setup();

    render(<ThemeToggleButton label="Đổi giao diện sáng tối" />);

    await user.click(
      screen.getByRole("button", { name: "Đổi giao diện sáng tối" }),
    );

    // jsdom has no `startViewTransition`, and neither do Firefox or older
    // Safari — the theme must change anyway, without the wipe.
    expect(setTheme).toHaveBeenCalledWith("dark");
  });

  it("runs the switch inside the transition when the browser supports it", async () => {
    const user = userEvent.setup();
    const startViewTransition = vi.fn((callback: () => void) => {
      expect(setTheme).not.toHaveBeenCalled();
      callback();
    });

    // Defined on the instance rather than assigned: the DOM lib types the real
    // member as returning a ViewTransition, and a stub that returns nothing is
    // not assignable to it. "configurable" is what lets afterEach take the
    // property back off again, so the fallback test still sees it missing.
    Object.defineProperty(document, "startViewTransition", {
      configurable: true,
      value: startViewTransition,
    });

    render(<ThemeToggleButton label="Đổi giao diện sáng tối" />);

    await user.click(
      screen.getByRole("button", { name: "Đổi giao diện sáng tối" }),
    );

    expect(startViewTransition).toHaveBeenCalledOnce();
    // The theme must change *through* the callback, not beside it — otherwise
    // the browser snapshots the old and the new frame in the same state and
    // there is nothing to wipe between.
    expect(setTheme).toHaveBeenCalledWith("dark");
  });
});
