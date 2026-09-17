import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { mockContracts } from "~/constants/mock/contracts";
import { ROUTES } from "~/constants/routes";
import { AppRoutes } from "~/pages/main";
import { useAuthStore } from "~/stores/use-auth-store";

const initialAuthState = useAuthStore.getState();

function renderAt(path: string) {
  const router = createMemoryRouter([{ path: "*", element: <AppRoutes /> }], {
    initialEntries: [path],
  });
  render(
    <QueryClientProvider client={new QueryClient()}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );
  return router;
}

// spec #153 AC #162: "ACTIVE gia hạn xong có một mục lịch sử và badge quay
// về Đang hiệu lực". C001 is EXPIRING (live) with an empty renewalHistory.
describe("ContractRenewTemplate", () => {
  beforeEach(() => {
    useAuthStore.setState({ token: "a-token" });
  });

  afterEach(() => {
    useAuthStore.setState(initialAuthState, true);
  });

  it("renewing writes a lịch sử entry and returns the badge to Đang hiệu lực", async () => {
    const contract = mockContracts.find((item) => item.id === "C001");
    if (!contract) throw new Error("Fixture C001 missing from the Mock");
    expect(contract.renewalHistory).toHaveLength(0);

    const user = userEvent.setup();
    renderAt(ROUTES.contractRenewPath(contract.id));

    await user.click(
      await screen.findByRole(
        "button",
        { name: "Ngày kết thúc mới" },
        { timeout: 5000 },
      ),
    );
    await user.click(await screen.findByText("20", {}, { timeout: 5000 }));
    await user.click(screen.getByRole("button", { name: "Tiếp tục" }));
    await user.click(screen.getByRole("button", { name: "Xác nhận gia hạn" }));

    // Lands back on the detail screen — badge no longer "Sắp hết hạn".
    expect(
      await screen.findByText("Đang hiệu lực", {}, { timeout: 5000 }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("tab", { name: "Lịch sử" }));
    expect(screen.getByText(/^Gia hạn ·/)).toBeInTheDocument();
    expect(contract.renewalHistory).toHaveLength(1);
  }, 15000);
});
