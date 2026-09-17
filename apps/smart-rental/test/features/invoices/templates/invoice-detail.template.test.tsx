import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import { describe, expect, it } from "vitest";

import InvoiceDetailTemplate from "~/features/invoices/templates/invoice-detail.template";

// The template alone, with the two providers it reaches for (a router for
// the back link, a query client for the Mock) — the route wiring is
// `test/pages/main.test.tsx`'s business.
function renderInvoice(invoiceId: string) {
  const router = createMemoryRouter(
    [{ path: "*", element: <InvoiceDetailTemplate invoiceId={invoiceId} /> }],
    { initialEntries: ["/"] },
  );
  render(
    <QueryClientProvider client={new QueryClient()}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );
}

describe("InvoiceDetailTemplate", () => {
  it("opens the VietQR dialog with the amount still owed and the transfer note", async () => {
    const user = userEvent.setup();
    // I071 = C001's kỳ 09, OVERDUE (SEPTEMBER_STATUS) — nothing paid yet, so
    // "còn phải trả" is the full total, and its Toà nhà (b1) has a bank account.
    renderInvoice("I071");

    await user.click(
      await screen.findByRole("button", { name: "Thanh toán VietQR" }),
    );

    const dialog = await screen.findByRole("dialog", {
      name: "Mã thanh toán VietQR",
    });
    // addInfo = invoiceNumber + room, diacritics stripped (spec #153 §10 row 12).
    expect(dialog).toHaveTextContent("HOA-071 Phong 102");
    // rent 2.700.000 + điện 350.000 + nước 90.000 + dịch vụ 100.000 — vi-VN
    // spells the thousands with a dot.
    expect(dialog).toHaveTextContent("3.240.000");
    expect(
      screen.getByRole("img", { name: "Mã VietQR cho HÓA-071" }),
    ).toBeInTheDocument();
  });

  it("warns instead of a QR when the Toà nhà has no Tài khoản nhận tiền", async () => {
    const user = userEvent.setup();
    // I012 = the first b3 (Chung cư Mini Lê Duẩn) contract's kỳ 04 — b3
    // deliberately has no bankAccount.
    renderInvoice("I012");

    await user.click(
      await screen.findByRole("button", { name: "Thanh toán VietQR" }),
    );

    expect(
      await screen.findByText(
        "Toà nhà chưa khai Tài khoản nhận tiền — chưa thể tạo mã VietQR.",
      ),
    ).toBeInTheDocument();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("says so when the id matches no Hoá đơn", async () => {
    renderInvoice("khong-co");

    expect(
      await screen.findByText("Không tìm thấy hoá đơn."),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Thanh toán VietQR" }),
    ).not.toBeInTheDocument();
  });
});
