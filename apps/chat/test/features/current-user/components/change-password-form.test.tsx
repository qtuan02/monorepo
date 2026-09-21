import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ChangePasswordForm } from "~/features/current-user/components/change-password-form";

const { changePassword } = vi.hoisted(() => ({
  changePassword: vi.fn(),
}));

vi.mock("~/libs/http-client", () => ({
  chatUserService: { changePassword },
}));

function renderForm(onSuccess: () => void = () => {}) {
  render(
    <QueryClientProvider client={new QueryClient()}>
      <ChangePasswordForm onSuccess={onSuccess} />
    </QueryClientProvider>,
  );
}

describe("ChangePasswordForm", () => {
  beforeEach(() => {
    changePassword.mockReset();
  });

  it("errors on the confirm field when it doesn't match, without calling the service", async () => {
    const user = userEvent.setup();
    renderForm();

    await user.type(screen.getByLabelText("Current password"), "old-password");
    await user.type(screen.getByLabelText("New password"), "new-password1");
    await user.type(
      screen.getByLabelText("Confirm new password"),
      "new-password2",
    );
    await user.click(screen.getByRole("button", { name: "Change password" }));

    expect(
      await screen.findByText("Passwords do not match."),
    ).toBeInTheDocument();
    expect(changePassword).not.toHaveBeenCalled();
  });

  it("errors on the confirm field when it's left empty", async () => {
    const user = userEvent.setup();
    renderForm();

    await user.type(screen.getByLabelText("Current password"), "old-password");
    await user.type(screen.getByLabelText("New password"), "new-password1");
    await user.click(screen.getByRole("button", { name: "Change password" }));

    expect(
      await screen.findByText("Please confirm your new password."),
    ).toBeInTheDocument();
    expect(changePassword).not.toHaveBeenCalled();
  });

  it("errors when the new password is under 8 characters", async () => {
    const user = userEvent.setup();
    renderForm();

    await user.type(screen.getByLabelText("Current password"), "old-password");
    await user.type(screen.getByLabelText("New password"), "short12");
    await user.type(screen.getByLabelText("Confirm new password"), "short12");
    await user.click(screen.getByRole("button", { name: "Change password" }));

    expect(
      await screen.findByText("New password must be 8–72 characters."),
    ).toBeInTheDocument();
    expect(changePassword).not.toHaveBeenCalled();
  });

  it("calls the service with only the two fields chat-socket expects, then resets the form", async () => {
    const user = userEvent.setup();
    changePassword.mockResolvedValue(undefined);
    renderForm();

    await user.type(screen.getByLabelText("Current password"), "old-password");
    await user.type(screen.getByLabelText("New password"), "new-password1");
    await user.type(
      screen.getByLabelText("Confirm new password"),
      "new-password1",
    );
    await user.click(screen.getByRole("button", { name: "Change password" }));

    await waitFor(() =>
      expect(changePassword).toHaveBeenCalledWith({
        currentPassword: "old-password",
        newPassword: "new-password1",
      }),
    );
    await waitFor(() =>
      expect(screen.getByLabelText("Current password")).toHaveValue(""),
    );
    expect(screen.getByLabelText("New password")).toHaveValue("");
    expect(screen.getByLabelText("Confirm new password")).toHaveValue("");
  }, 10_000);
});
