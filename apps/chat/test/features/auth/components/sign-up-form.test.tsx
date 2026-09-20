import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";

import SignUpForm from "~/features/auth/components/sign-up-form";

const { chatSignUp, chatSignIn } = vi.hoisted(() => ({
  chatSignUp: vi.fn(),
  chatSignIn: vi.fn(),
}));

vi.mock("~/libs/http-client", () => ({
  chatAuthService: { signUp: chatSignUp, signIn: chatSignIn },
}));

function renderForm() {
  render(
    <QueryClientProvider client={new QueryClient()}>
      <MemoryRouter>
        <SignUpForm />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe("SignUpForm", () => {
  beforeEach(() => {
    chatSignUp.mockReset();
    chatSignIn.mockReset();
  });

  it("shows the source's own validation messages on an empty submit", async () => {
    const user = userEvent.setup();
    renderForm();

    await user.click(screen.getByRole("button", { name: "Sign up" }));

    expect(
      await screen.findByText("Please enter a valid email address."),
    ).toBeInTheDocument();
    expect(screen.getByText("First name is required.")).toBeInTheDocument();
    expect(screen.getByText("Last name is required.")).toBeInTheDocument();
    expect(screen.getByText("Username is required.")).toBeInTheDocument();
    expect(
      screen.getByText("Password must be at least 6 characters."),
    ).toBeInTheDocument();
    expect(chatSignUp).not.toHaveBeenCalled();
  });

  // Five fields typed with userEvent, then a submit — comfortably under 5s
  // alone, but this monorepo runs every workspace's suite in parallel through
  // Turbo, and CPU contention there has pushed this one past the default
  // timeout (see the same bump below).
  it("calls the service with the entered payload on a valid submit", async () => {
    const user = userEvent.setup();
    chatSignUp.mockResolvedValue(undefined);
    renderForm();

    await user.type(screen.getByLabelText("Email"), "tuan@example.com");
    await user.type(screen.getByLabelText("First name"), "Tuan");
    await user.type(screen.getByLabelText("Last name"), "Huynh");
    await user.type(screen.getByLabelText("Username"), "tuanhq02");
    await user.type(screen.getByLabelText("Password"), "secret1");
    await user.click(screen.getByRole("button", { name: "Sign up" }));

    await waitFor(() =>
      expect(chatSignUp).toHaveBeenCalledWith({
        email: "tuan@example.com",
        firstName: "Tuan",
        lastName: "Huynh",
        username: "tuanhq02",
        password: "secret1",
      }),
    );
  }, 10_000);

  it("offers an immediate sign-in once the account is created", async () => {
    const user = userEvent.setup();
    chatSignUp.mockResolvedValue(undefined);
    chatSignIn.mockResolvedValue("a-token");
    renderForm();

    await user.type(screen.getByLabelText("Email"), "tuan@example.com");
    await user.type(screen.getByLabelText("First name"), "Tuan");
    await user.type(screen.getByLabelText("Last name"), "Huynh");
    await user.type(screen.getByLabelText("Username"), "tuanhq02");
    await user.type(screen.getByLabelText("Password"), "secret1");
    await user.click(screen.getByRole("button", { name: "Sign up" }));

    await user.click(
      await screen.findByRole("button", { name: "Yes, sign in" }),
    );

    await waitFor(() =>
      expect(chatSignIn).toHaveBeenCalledWith({
        username: "tuanhq02",
        password: "secret1",
      }),
    );
  }, 10_000);
});
