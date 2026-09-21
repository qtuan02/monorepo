import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";

import { LanguageToggleButton } from "~/components/select/language-toggle-button";
import i18n from "~/libs/i18n";

describe("LanguageToggleButton", () => {
  afterEach(async () => {
    await i18n.changeLanguage("en");
  });

  it("lists every registry language, checks the active one, and switches i18next on pick", async () => {
    const user = userEvent.setup();
    render(<LanguageToggleButton />);

    await user.click(screen.getByRole("button", { name: "Language" }));

    expect(
      await screen.findByRole("menuitemradio", { name: "English" }),
    ).toHaveAttribute("aria-checked", "true");

    await user.click(screen.getByRole("menuitemradio", { name: "Vietnamese" }));

    expect(i18n.resolvedLanguage).toBe("vi");
    // The control re-renders in the language it just switched to.
    expect(
      screen.getByRole("button", { name: "Ngôn ngữ" }),
    ).toBeInTheDocument();
  });
});
