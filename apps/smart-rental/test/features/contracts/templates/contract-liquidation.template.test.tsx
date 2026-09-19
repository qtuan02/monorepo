import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { mockContracts } from "~/constants/mock/contracts";
import { mockInvoices } from "~/constants/mock/invoices";
import { ROUTES } from "~/constants/routes";
import { AppRoutes } from "~/pages/main";
import { useAuthStore } from "~/stores/use-auth-store";
import {
  computeContractDebt,
  computeDepositSettlement,
} from "~/utils/contract-liquidation";
import { formatCurrency } from "~/utils/currency";
import { deriveInvoiceStatus } from "~/utils/invoice-status";

const initialAuthState = useAuthStore.getState();

// `formatCurrency` interposes a NBSP before "₫" (`Intl.NumberFormat`'s
// `vi-VN` format); RTL's default normalizer collapses the DOM's own NBSP to
// a plain space before comparing, but never touches the query string, so a
// raw NBSP in the query never matches (same gotcha as `test/pages/main.test.tsx`).
const NBSP = String.fromCharCode(160);
function withoutNbsp(text: string) {
  return text.split(NBSP).join(" ");
}

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

// C004 (spec #153 AC #162): EXPIRING (live), b1, September carries a PARTIAL
// invoice — a real nợ thật to net against the Cọc, off the Mock rather than
// a hand-fed prop.
describe("ContractLiquidationTemplate — quyết toán Cọc", () => {
  beforeEach(() => {
    useAuthStore.setState({ token: "a-token" });
  });

  afterEach(() => {
    useAuthStore.setState(initialAuthState, true);
  });

  it("hides Số trả lại until a cách quyết toán is chosen (spec #179)", async () => {
    const contract = mockContracts.find((item) => item.id === "C004");
    if (!contract) throw new Error("Fixture C004 missing from the Mock");

    renderAt(ROUTES.contractLiquidationPath(contract.id));

    await screen.findByRole("radio", { name: "Giữ toàn bộ (không hoàn)" });
    expect(
      screen.getByText("Chọn cách quyết toán để xem số trả lại."),
    ).toBeInTheDocument();
  }, 15000);

  it("computes Số trả lại for hoàn một phần off the contract's own nợ thật", async () => {
    const contract = mockContracts.find((item) => item.id === "C004");
    if (!contract) throw new Error("Fixture C004 missing from the Mock");

    const debt = computeContractDebt(
      mockInvoices
        .filter((invoice) => invoice.contractId === contract.id)
        .map((invoice) => ({
          ...invoice,
          status: deriveInvoiceStatus(invoice),
        })),
    );
    expect(debt).toBeGreaterThan(0); // the scenario only means something with real nợ

    const settlement = computeDepositSettlement({
      depositAmount: contract.depositAmount,
      outstandingDebt: debt,
      decision: "PARTIAL_RETURNED",
    });

    const user = userEvent.setup();
    renderAt(ROUTES.contractLiquidationPath(contract.id));

    await user.click(
      await screen.findByRole(
        "radio",
        { name: "Hoàn một phần" },
        { timeout: 5000 },
      ),
    );

    expect(
      await screen.findByText(
        withoutNbsp(formatCurrency(settlement.returnedAmount)),
        {},
        { timeout: 5000 },
      ),
    ).toBeInTheDocument();
  }, 15000);

  it("hides Gia hạn/Thanh lý and Xóa once a Hợp đồng is TERMINATED", async () => {
    const contract = mockContracts.find((item) => item.id === "C004");
    if (!contract) throw new Error("Fixture C004 missing from the Mock");

    const user = userEvent.setup();
    renderAt(ROUTES.contractLiquidationPath(contract.id));

    await user.click(
      await screen.findByRole(
        "radio",
        { name: "Giữ toàn bộ (không hoàn)" },
        { timeout: 5000 },
      ),
    );
    await user.click(screen.getByRole("button", { name: "Xác nhận thanh lý" }));

    // Lands back on the (now TERMINATED) detail screen — spec #153 AC #162:
    // an ended Hợp đồng shows neither the lifecycle actions nor "Xóa".
    expect(
      await screen.findByText("Đã thanh lý", {}, { timeout: 5000 }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "Gia hạn" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "Thanh lý" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Xóa" }),
    ).not.toBeInTheDocument();
  }, 15000);

  // C001 (Nguyễn Văn A, R-B1-102) — a contract no other test in this file
  // touches, so this test stays order-independent (spec #205 ticket C AC).
  it("Thanh lý → lưới Phòng và chi tiết Phòng không còn Người thuê cũ (ADR-0015 §2)", async () => {
    const contract = mockContracts.find((item) => item.id === "C001");
    if (!contract) throw new Error("Fixture C001 missing from the Mock");
    const tenantName = contract.tenant;
    const roomId = contract.roomId;

    const user = userEvent.setup();
    const router = renderAt(ROUTES.contractLiquidationPath(contract.id));

    await user.click(
      await screen.findByRole(
        "radio",
        { name: "Giữ toàn bộ (không hoàn)" },
        { timeout: 5000 },
      ),
    );
    await user.click(screen.getByRole("button", { name: "Xác nhận thanh lý" }));
    await screen.findByText("Đã thanh lý", {}, { timeout: 5000 });

    await router.navigate(ROUTES.roomDetailPath(roomId));

    expect(
      await screen.findByText("— (trống)", {}, { timeout: 5000 }),
    ).toBeInTheDocument();
    expect(screen.queryByText(tenantName)).not.toBeInTheDocument();
  }, 15000);
});
