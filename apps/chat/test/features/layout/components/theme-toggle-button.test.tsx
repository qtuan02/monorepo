import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import ThemeToggleButton from "~/features/layout/components/theme-toggle-button";
import { ThemeProvider } from "~/features/layout/provider/theme-provider";

describe("ThemeToggleButton", () => {
  it("offers Light/Dark/System, all enabled, System checked by default", async () => {
    const user = userEvent.setup();

    render(
      <ThemeProvider>
        <ThemeToggleButton />
      </ThemeProvider>,
    );

    await user.click(screen.getByRole("button", { name: "Appearance" }));

    for (const name of ["Light", "Dark", "System"]) {
      expect(
        await screen.findByRole("menuitemradio", { name }),
      ).not.toHaveAttribute("aria-disabled", "true");
    }

    // System is the default, and it is the one already checked.
    expect(
      screen.getByRole("menuitemradio", { name: "System" }),
    ).toHaveAttribute("aria-checked", "true");
  });
});
