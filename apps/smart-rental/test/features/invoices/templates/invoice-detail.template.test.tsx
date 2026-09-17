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
  it("opens the VietQR dialog with the amount and the transfer note", async () => {
    const user = userEvent.setup();
    renderInvoice("I001");

    await user.click(
      await screen.findByRole("button", { name: "Thanh toán VietQR" }),
    );

    const dialog = await screen.findByRole("dialog", {
      name: "Mã thanh toán VietQR",
    });
    expect(dialog).toHaveTextContent("Thanh toan HÓA-001");
    // I001: 3.000.000 + (0 % 5) * 200.000 — vi-VN spells the thousands with a dot.
    expect(dialog).toHaveTextContent("3.000.000");
    expect(
      screen.getByRole("img", { name: "Mã VietQR cho HÓA-001" }),
    ).toBeInTheDocument();
  });

  it("says so when the id matches no Hoá đơn", async () => {
    renderInvoice("khong-co");

    expect(
      await screen.findByText("Không tìm thấy hóa đơn."),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Thanh toán VietQR" }),
    ).not.toBeInTheDocument();
  });
});
