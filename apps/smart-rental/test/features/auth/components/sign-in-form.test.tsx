import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";

import SignInForm from "~/features/auth/components/sign-in-form";
import { useAuthStore } from "~/stores/use-auth-store";

const initialAuthState = useAuthStore.getState();

function renderSignInForm() {
  return render(
    <MemoryRouter>
      <SignInForm />
    </MemoryRouter>,
  );
}

describe("SignInForm", () => {
  beforeEach(() => {
    useAuthStore.setState(initialAuthState, true);
  });

  it("stores a token once the form passes validation — there is no backend to call", async () => {
    const user = userEvent.setup();

    renderSignInForm();
    // The prototype prefills demo credentials, so a bare submit signs in.
    await user.click(screen.getByRole("button", { name: "Đăng nhập" }));

    await vi.waitFor(() =>
      expect(useAuthStore.getState().token).toBe("local-admin@gmail.com"),
    );
  });

  it("rejects a too-short password without signing in", async () => {
    const user = userEvent.setup();

    renderSignInForm();
    await user.clear(screen.getByLabelText("Mật khẩu"));
    await user.type(screen.getByLabelText("Mật khẩu"), "123");
    await user.click(screen.getByRole("button", { name: "Đăng nhập" }));

    expect(
      await screen.findByText("Mật khẩu phải có ít nhất 6 ký tự"),
    ).toBeInTheDocument();
    expect(useAuthStore.getState().token).toBeNull();
  });

  it("rejects a malformed email", async () => {
    const user = userEvent.setup();

    renderSignInForm();
    await user.clear(screen.getByLabelText("Email"));
    await user.type(screen.getByLabelText("Email"), "khong-phai-email");
    await user.click(screen.getByRole("button", { name: "Đăng nhập" }));

    expect(await screen.findByText("Email không hợp lệ")).toBeInTheDocument();
    expect(useAuthStore.getState().token).toBeNull();
  });
});
