import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import { describe, expect, it } from "vitest";

import { ROUTES } from "~/constants/routes";
import OnboardingWizardTemplate from "~/features/onboarding/templates/onboarding-wizard.template";

// A data router so the test can read where the last step sent the landlord;
// the dashboard route is a stub, this test is about the wizard only.
function renderWizard() {
  const router = createMemoryRouter(
    [
      { path: ROUTES.ONBOARDING, element: <OnboardingWizardTemplate /> },
      { path: ROUTES.HOME, element: <h1>Hôm nay</h1> },
    ],
    { initialEntries: [ROUTES.ONBOARDING] },
  );
  render(<RouterProvider router={router} />);
  return router;
}

describe("OnboardingWizardTemplate", () => {
  it("walks the three steps, validating only the current one, and lands on the dashboard", async () => {
    const user = userEvent.setup({ delay: null });
    const router = renderWizard();

    expect(screen.getByRole("button", { name: "Quay lại" })).toBeDisabled();

    // Step 1 refuses to advance on an empty name…
    await user.click(screen.getByRole("button", { name: "Tiếp tục" }));
    expect(
      await screen.findByText("Tên khu trọ tối thiểu 2 ký tự"),
    ).toBeInTheDocument();
    expect(screen.getByText("Toà nhà của bạn")).toBeInTheDocument();

    // …and moves on once its own fields hold.
    await user.type(screen.getByLabelText("Tên khu trọ"), "Trọ Sinh Viên");
    await user.type(screen.getByLabelText("Địa chỉ"), "123 Ngũ Hành Sơn");
    await user.click(screen.getByRole("button", { name: "Tiếp tục" }));
    expect(await screen.findByText("Thêm phòng nhanh")).toBeInTheDocument();

    // Step 2: the rent is empty by default, so it blocks until typed.
    await user.click(screen.getByRole("button", { name: "Tiếp tục" }));
    expect(
      await screen.findByText("Vui lòng nhập giá thuê"),
    ).toBeInTheDocument();
    await user.type(screen.getByLabelText("Giá thuê mặc định"), "3000000");
    await user.click(screen.getByRole("button", { name: "Tiếp tục" }));
    expect(
      await screen.findByText(
        "Bạn có muốn ai đó cùng quản lý khu trọ này không?",
      ),
    ).toBeInTheDocument();

    // Step 3 is optional — "Hoàn thành" with no email goes to the dashboard.
    await user.click(screen.getByRole("button", { name: "Hoàn thành" }));
    expect(
      await screen.findByRole("heading", { name: "Hôm nay" }),
    ).toBeInTheDocument();
    expect(router.state.location.pathname).toBe(ROUTES.HOME);
  }, 15_000);

  it("goes back a step without losing what was typed", async () => {
    const user = userEvent.setup({ delay: null });
    renderWizard();

    await user.type(screen.getByLabelText("Tên khu trọ"), "Trọ Sinh Viên");
    await user.type(screen.getByLabelText("Địa chỉ"), "123 Ngũ Hành Sơn");
    await user.click(screen.getByRole("button", { name: "Tiếp tục" }));
    await screen.findByText("Thêm phòng nhanh");

    await user.click(screen.getByRole("button", { name: "Quay lại" }));

    expect(screen.getByLabelText("Tên khu trọ")).toHaveValue("Trọ Sinh Viên");
  });

  it("skips straight to the dashboard", async () => {
    const user = userEvent.setup({ delay: null });
    const router = renderWizard();

    await user.click(screen.getByRole("button", { name: "Bỏ qua" }));

    expect(
      await screen.findByRole("heading", { name: "Hôm nay" }),
    ).toBeInTheDocument();
    expect(router.state.location.pathname).toBe(ROUTES.HOME);
  });
});
