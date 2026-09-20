import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { mockContracts } from "~/constants/mock/contracts";
import { ROUTES } from "~/constants/routes";
import { computeRenewedEndDate } from "~/features/contracts/utils/contract-term";
import { AppRoutes } from "~/pages/main";
import { useAuthStore } from "~/stores/use-auth-store";
import { formatDate } from "~/utils/date";

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

  it("renewing writes a lịch sử entry (kèm ghi chú) and returns the badge to Đang hiệu lực", async () => {
    const contract = mockContracts.find((item) => item.id === "C001");
    if (!contract) throw new Error("Fixture C001 missing from the Mock");
    expect(contract.renewalHistory).toHaveLength(0);

    const user = userEvent.setup();
    renderAt(ROUTES.contractRenewPath(contract.id));

    // Card xác nhận có từ đầu — không cần bấm "Tiếp tục" trước.
    await user.click(
      await screen.findByRole(
        "button",
        { name: "12 tháng" },
        { timeout: 5000 },
      ),
    );
    await user.type(
      screen.getByRole("textbox", { name: "Ghi chú" }),
      "Tăng giá theo thị trường",
    );
    await user.click(screen.getByRole("button", { name: "Xác nhận gia hạn" }));

    // Lands back on the detail screen — badge no longer "Sắp hết hạn". Shows
    // both in the badge and, on mobile, in the header stepper's summary line.
    expect(
      await screen.findAllByText("Đang hiệu lực", {}, { timeout: 5000 }),
    ).not.toHaveLength(0);

    await user.click(screen.getByRole("tab", { name: "Lịch sử" }));
    expect(screen.getByText(/^Gia hạn ·/)).toBeInTheDocument();
    expect(contract.renewalHistory).toHaveLength(1);
    expect(contract.renewalHistory[0]?.notes).toBe("Tăng giá theo thị trường");
  }, 15000);

  // ADR-0015 §2 (spec #205 ticket C AC): TenantView.contractEnd reads off
  // the tenant's live Hợp đồng, so a Gia hạn shows through immediately.
  it("Gia hạn → chi tiết Người thuê hiện ngày hết Hợp đồng mới", async () => {
    const contract = mockContracts.find((item) => item.id === "C001");
    if (!contract) throw new Error("Fixture C001 missing from the Mock");
    const previousEndDate = contract.endDate;
    const expectedNewEndDate = formatDate(
      computeRenewedEndDate(contract.endDate, 12),
    );

    const user = userEvent.setup();
    const router = renderAt(ROUTES.contractRenewPath(contract.id));

    await user.click(
      await screen.findByRole(
        "button",
        { name: "12 tháng" },
        { timeout: 5000 },
      ),
    );
    await user.click(screen.getByRole("button", { name: "Xác nhận gia hạn" }));
    await screen.findAllByText("Đang hiệu lực", {}, { timeout: 5000 });

    // The grid view's TenantCard is what actually prints "HĐ: <contractEnd>"
    // — the table's default view has no such column.
    await router.navigate(`${ROUTES.TENANTS}?view=grid`);

    expect(
      await screen.findByText(
        new RegExp(`HĐ: ${expectedNewEndDate}`),
        {},
        { timeout: 5000 },
      ),
    ).toBeInTheDocument();
    expect(
      screen.queryByText(new RegExp(`HĐ: ${previousEndDate}`)),
    ).not.toBeInTheDocument();
  }, 15000);
});
