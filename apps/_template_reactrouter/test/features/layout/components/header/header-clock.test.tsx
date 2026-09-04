import { render, screen } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import HeaderClock from "~/features/layout/components/header/header-clock";
import i18n from "~/libs/i18n";

// A Monday, so the weekday is a different word in each language. The hour is
// asserted as sent because `vitest.config.ts` pins TZ=UTC.
const FIXED_NOW = Date.UTC(2024, 0, 1, 8, 30, 15);

beforeEach(() => {
  vi.spyOn(Date, "now").mockReturnValue(FIXED_NOW);
});

afterEach(async () => {
  // The language is a process-wide singleton, so a case that moves it has to
  // put it back or it leaks into whatever runs next in this file.
  await i18n.changeLanguage("vi");
});

describe("HeaderClock", () => {
  it("renders nothing on the server", () => {
    // The whole reason this component differs from the Vite Template's: the
    // server renders at one instant and the browser hydrates at another, so a
    // clock seeded during the first render is a guaranteed hydration mismatch.
    // Empty server output is what makes the two sides agree.
    expect(renderToString(<HeaderClock />)).toBe("");
  });

  it("shows the time once it has mounted in a browser", () => {
    render(<HeaderClock />);

    expect(screen.getByText("08:30:15")).toBeInTheDocument();
  });

  it("re-renders the weekday in the language that is switched to", async () => {
    render(<HeaderClock />);

    expect(screen.getByText("thứ hai, 01/01/2024")).toBeInTheDocument();

    await i18n.changeLanguage("en");

    // The guarantee dates-locale-render-input exists for: dayjs's active locale
    // is global state React cannot see, so a component that did not thread the
    // language into `.locale()` would keep painting the Vietnamese weekday here
    // — and under the React Compiler it would do so even though it re-rendered.
    expect(await screen.findByText("Monday, 01/01/2024")).toBeInTheDocument();
  });
});
