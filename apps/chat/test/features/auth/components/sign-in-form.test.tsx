import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";

import SignInForm from "~/features/auth/components/sign-in-form";

const { chatSignIn } = vi.hoisted(() => ({ chatSignIn: vi.fn() }));

vi.mock("~/libs/http-client", () => ({
  chatAuthService: { signIn: chatSignIn },
}));

function renderForm() {
  render(
    <QueryClientProvider client={new QueryClient()}>
      <MemoryRouter>
        <SignInForm />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe("SignInForm", () => {
  beforeEach(() => {
    chatSignIn.mockReset();
  });

  it("shows the source's own validation messages on an empty submit", async () => {
    const user = userEvent.setup();
    renderForm();

    await user.click(screen.getByRole("button", { name: "Sign in" }));

    expect(
      await screen.findByText("Username is required."),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Password must be at least 6 characters."),
    ).toBeInTheDocument();
    expect(chatSignIn).not.toHaveBeenCalled();
  });

  it("calls the service with the entered payload on a valid submit", async () => {
    const user = userEvent.setup();
    chatSignIn.mockResolvedValue("a-token");
    renderForm();

    await user.type(screen.getByLabelText("Username"), "tuanhq02");
    await user.type(screen.getByLabelText("Password"), "secret1");
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    await waitFor(() =>
      expect(chatSignIn).toHaveBeenCalledWith({
        username: "tuanhq02",
        password: "secret1",
      }),
    );
  });
});
