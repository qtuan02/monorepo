import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import { describe, expect, it } from "vitest";

import type { Invoice } from "~/types/invoice";
import { mockInvoices } from "~/constants/mock/invoices";
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

  // A due date far in the future — the only way to see PARTIAL rather than
  // OVERDUE, since deriveInvoiceStatus checks the due date before it (see
  // ~/utils/invoice-status.ts).
  const paymentTestInvoice: Invoice = {
    id: "I-test-payment",
    buildingId: "b1",
    contractId: "C001",
    invoiceNumber: "HÓA-TEST-PAY",
    tenant: "Nguyễn Văn A",
    room: "Phòng 102",
    floor: 1,
    amount: 4_500_000,
    lineItems: [
      {
        type: "RENT",
        description: "Tiền phòng",
        quantity: 1,
        unitPrice: 4_500_000,
        amount: 4_500_000,
      },
    ],
    payments: [],
    paidAmount: 0,
    reminders: [],
    billingMonth: "2099-01",
    month: "01/2099",
    dueDate: "31/01/2099",
    status: "UNPAID",
    paymentDate: null,
    lastUpdated: "01/01/2099",
  };

  it("Ghi 2 tr rồi 2,5 tr cho một Hoá đơn 4,5 tr → hai mục Thanh toán, badge Thu một phần rồi Đã thu", async () => {
    if (!mockInvoices.some((invoice) => invoice.id === paymentTestInvoice.id)) {
      mockInvoices.push({ ...paymentTestInvoice });
    }
    const user = userEvent.setup();
    renderInvoice("I-test-payment");

    await user.click(await screen.findByRole("tab", { name: /Thanh toán/ }));
    await user.click(
      screen.getByRole("button", { name: "Ghi nhận Thanh toán" }),
    );
    await user.type(await screen.findByLabelText(/Số tiền/), "2000000");
    await user.click(screen.getByRole("button", { name: "Lưu lại" }));

    expect(await screen.findByText("Thu một phần")).toBeInTheDocument();
    expect(
      screen.getByRole("tab", { name: "Thanh toán (1)" }),
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: "Ghi nhận Thanh toán" }),
    );
    await user.type(await screen.findByLabelText(/Số tiền/), "2500000");
    await user.click(screen.getByRole("button", { name: "Lưu lại" }));

    expect(await screen.findByText("Đã thu")).toBeInTheDocument();
    expect(
      screen.getByRole("tab", { name: "Thanh toán (2)" }),
    ).toBeInTheDocument();
  });

  it("logs a Gửi nhắc — đã nhắc n lần, lần cuối — on the Nhắc nợ tab", async () => {
    const user = userEvent.setup();
    // I071 = C001's kỳ 09, OVERDUE — reminders start empty either way.
    renderInvoice("I071");

    await user.click(await screen.findByRole("tab", { name: "Nhắc nợ" }));
    expect(screen.getByText("Chưa gửi nhắc lần nào.")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Gửi nhắc" }));
    await user.click(await screen.findByRole("button", { name: "Gửi" }));

    expect(
      await screen.findByText(/^Đã nhắc 1 lần, lần cuối/),
    ).toBeInTheDocument();
  });
});
