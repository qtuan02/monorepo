import { composeStories } from "@storybook/react-vite";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test } from "vitest";

import * as formStories from "../src/stories/form.stories";

// stories.test.tsx only proves these render. The wiring that actually earns a
// test is ours, not Base UI's: the Controller ↔ zodResolver ↔ FieldError path
// that decides whether a user ever sees why a submit was rejected.
const { Default, HorizontalField } = composeStories(formStories);

describe("form stories", () => {
  test("submitting an empty profile form surfaces each field's message", async () => {
    const user = userEvent.setup();
    render(<Default />);

    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(
      await screen.findByText("Username must be at least 3 characters."),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Please enter a valid email address."),
    ).toBeInTheDocument();
  });

  test("a valid profile submit reports no error", async () => {
    const user = userEvent.setup();
    render(<Default />);

    await user.type(screen.getByLabelText("Username"), "monorepo");
    await user.type(screen.getByLabelText("Email"), "user@example.com");
    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(
      screen.queryByText("Username must be at least 3 characters."),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText("Please enter a valid email address."),
    ).not.toBeInTheDocument();
  });

  test("an unchecked required checkbox reports its own message", async () => {
    const user = userEvent.setup();
    render(<HorizontalField />);

    await user.type(screen.getByLabelText("Email"), "user@example.com");
    await user.click(screen.getByRole("button", { name: "Send invite" }));

    expect(
      await screen.findByText("You must accept the terms to continue."),
    ).toBeInTheDocument();
  });
});
