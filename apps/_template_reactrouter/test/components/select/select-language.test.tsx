import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderToString } from "react-dom/server";
import { I18nextProvider } from "react-i18next";
import { afterEach, describe, expect, it } from "vitest";

import { createRequestI18n } from "@monorepo/i18n/i18next/create-request-i18n";

import { SelectLanguage } from "~/components/select/select-language";
import i18n from "~/libs/i18n";

afterEach(async () => {
  // i18next is a process-wide singleton: a case that switches it has to put it
  // back, or the next file in the run starts in English.
  await i18n.changeLanguage("vi");
});

describe("SelectLanguage", () => {
  it("server-renders the trigger in the request's language", () => {
    // Two things at once, and both are load-bearing for this Runtime. The
    // `@monorepo/ui` Select survives a server render at all — a closed Base UI
    // Select renders only its trigger, and the portal that would need a
    // `document` returns null. And the shape `entry.server` uses works: a clone
    // fixed to a language, handed to the provider, translates the tree without
    // the process singleton (still `vi`, per vitest.setup.ts) moving at all.
    const html = renderToString(
      <I18nextProvider i18n={createRequestI18n("en")}>
        <SelectLanguage />
      </I18nextProvider>,
    );

    expect(html).toContain("English");
    expect(html).not.toContain("Tiếng Việt");
    expect(i18n.resolvedLanguage).toBe("vi");
  });

  it("shows the language that is currently active", () => {
    render(<SelectLanguage />);

    expect(screen.getByRole("combobox")).toHaveTextContent("Tiếng Việt");
  });

  it("switches the language in place rather than navigating", async () => {
    const user = userEvent.setup();

    render(<SelectLanguage />);
    await user.click(screen.getByRole("combobox"));
    await user.click(await screen.findByRole("option", { name: "Tiếng Anh" }));

    // The switch is a state change: this Runtime keeps the language in a cookie,
    // so there is no URL to replace (contrast the Next Template's switcher).
    // `resolvedLanguage` is the registry code the tree now renders in.
    expect(i18n.resolvedLanguage).toBe("en");
    // And the trigger follows it, which is what proves the control is
    // controlled by i18next rather than by its own internal state.
    expect(await screen.findByRole("combobox")).toHaveTextContent("English");
  });
});
