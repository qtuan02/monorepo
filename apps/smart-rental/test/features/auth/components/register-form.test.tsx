import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ROUTES } from "~/constants/routes";
import RegisterForm from "~/features/auth/components/register-form";
import { useAuthStore } from "~/stores/use-auth-store";

const initialAuthState = useAuthStore.getState();

function renderRegisterForm() {
  const router = createMemoryRouter(
    [{ path: "*", element: <RegisterForm /> }],
    { initialEntries: [ROUTES.AUTH_REGISTER] },
  );
  render(<RouterProvider router={router} />);
  return router;
}

async function fill(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText("Họ và tên"), "Nguyễn Văn A");
  await user.type(screen.getByLabelText("Email"), "a@example.com");
  await user.type(screen.getByLabelText("Mật khẩu"), "matkhau");
}

describe("RegisterForm", () => {
  beforeEach(() => {
    useAuthStore.setState(initialAuthState, true);
  });

  it("signs the new landlord in and sends them to onboarding", async () => {
    const user = userEvent.setup();

    const router = renderRegisterForm();
    await fill(user);
    await user.click(screen.getByRole("button", { name: "Đăng ký" }));

    await vi.waitFor(() =>
      expect(useAuthStore.getState().token).toBe("local-a@example.com"),
    );
    expect(router.state.location.pathname).toBe(ROUTES.ONBOARDING);
  });

  it("rejects a one-character name without signing in", async () => {
    const user = userEvent.setup();

    renderRegisterForm();
    await fill(user);
    await user.clear(screen.getByLabelText("Họ và tên"));
    await user.type(screen.getByLabelText("Họ và tên"), "A");
    await user.click(screen.getByRole("button", { name: "Đăng ký" }));

    expect(
      await screen.findByText("Tên phải có ít nhất 2 ký tự"),
    ).toBeInTheDocument();
    expect(useAuthStore.getState().token).toBeNull();
  });
});
