import { composeStories } from "@storybook/react-vite";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import * as stories from "../src/stories/date-picker.stories";

// The dd/MM/yyyy input mask on DatePickerInput — digits only, auto-filled
// separators, day capped at 31 and month at 12 by pad-and-shift. Exercised
// through the WithInput story so the assertions run against the exact
// composition the workshop documents.
const { WithInput } = composeStories(stories);

function createUser() {
  return userEvent.setup({ pointerEventsCheck: 0 });
}

async function typeFresh(user: ReturnType<typeof createUser>, text: string) {
  render(<WithInput />);
  const input = screen.getByPlaceholderText("dd/mm/yyyy");
  await user.clear(input);
  if (text !== "") await user.type(input, text);
  return input;
}

describe("DatePickerInput — dd/MM/yyyy mask", () => {
  it("fills the separators automatically from a bare digit stream", async () => {
    const user = createUser();
    const input = await typeFresh(user, "14082026");
    expect(input).toHaveValue("14/08/2026");
  });

  it("pads and shifts a digit that would push the day past 31", async () => {
    const user = createUser();
    // "3" then "5" cannot be day 35 — it reads as day 03, month 05.
    const input = await typeFresh(user, "352026");
    expect(input).toHaveValue("03/05/2026");
  });

  it("pads and shifts a digit that would push the month past 12", async () => {
    const user = createUser();
    // after day 14, "9" cannot start month 9x — it reads as month 09.
    const input = await typeFresh(user, "149");
    expect(input).toHaveValue("14/09");
  });

  it("zero-pads a 1-digit segment when the user types the slash themselves", async () => {
    const user = createUser();
    const input = await typeFresh(user, "1/8/2026");
    expect(input).toHaveValue("01/08/2026");
  });

  it("ignores non-digit input entirely", async () => {
    const user = createUser();
    const input = await typeFresh(user, "abc!");
    expect(input).toHaveValue("");
  });

  it("backspace walks back through the mask without getting stuck on a separator", async () => {
    const user = createUser();
    const input = await typeFresh(user, "14082026");
    await user.type(input, "{backspace}{backspace}{backspace}{backspace}");
    expect(input).toHaveValue("14/08");
    await user.type(input, "{backspace}");
    expect(input).toHaveValue("14/0");
  });
});
