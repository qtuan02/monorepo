import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import SignInForm from "~/features/auth/components/sign-in-form";
import { useAuthStore } from "~/stores/use-auth-store";

const initialAuthState = useAuthStore.getState();

function renderSignInForm() {
  // A fresh client per test, retries off — no cache leaks between tests.
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <SignInForm />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe("SignInForm", () => {
  beforeEach(() => {
    useAuthStore.setState(initialAuthState, true);
  });

  afterEach(() => {
    useAuthStore.setState(initialAuthState, true);
  });

  it("stores a token once the form passes validation — there is no backend to call", async () => {
    const user = userEvent.setup();

    renderSignInForm();
    await user.type(screen.getByLabelText("Tài khoản"), "bacsi");
    await user.type(screen.getByLabelText("Mật khẩu"), "matkhau");
    await user.click(screen.getByRole("button", { name: "Đăng nhập" }));

    await vi.waitFor(() =>
      expect(useAuthStore.getState().token).toBe("local-bacsi"),
    );
  });

  it("rejects a too-short password without signing in", async () => {
    const user = userEvent.setup();

    renderSignInForm();
    await user.type(screen.getByLabelText("Tài khoản"), "bacsi");
    await user.type(screen.getByLabelText("Mật khẩu"), "123");
    await user.click(screen.getByRole("button", { name: "Đăng nhập" }));

    expect(
      await screen.findByText("Mật khẩu phải có ít nhất 6 ký tự."),
    ).toBeInTheDocument();
    expect(useAuthStore.getState().token).toBeNull();
  });

  it("rejects a whitespace-only username", async () => {
    const user = userEvent.setup();

    renderSignInForm();
    await user.type(screen.getByLabelText("Tài khoản"), "   ");
    await user.type(screen.getByLabelText("Mật khẩu"), "matkhau");
    await user.click(screen.getByRole("button", { name: "Đăng nhập" }));

    expect(
      await screen.findByText("Vui lòng nhập tài khoản."),
    ).toBeInTheDocument();
    expect(useAuthStore.getState().token).toBeNull();
  });
});
