import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import { describe, expect, it } from "vitest";

import type { Invoice } from "~/types/invoice";
import { mockInvoices } from "~/constants/mock/invoices";
import InvoiceDetailTemplate from "~/features/invoices/templates/invoice-detail.template";
import { queryClient } from "~/libs/query-client";

// The template alone, with the two providers it reaches for (a router for
// the back link, a query client for the Mock) — the route wiring is
// `test/pages/main.test.tsx`'s business. The app's own `queryClient`
// singleton, cleared per render — not a bare `new QueryClient()` — because
// ADR-0015 §3 moved every mutation's cache invalidation onto that
// singleton's global `MutationCache.onSuccess`.
function renderInvoice(invoiceId: string) {
  queryClient.clear();
  const router = createMemoryRouter(
    [{ path: "*", element: <InvoiceDetailTemplate invoiceId={invoiceId} /> }],
    { initialEntries: ["/"] },
  );
  render(
    <QueryClientProvider client={queryClient}>
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

    // VietQR is the screen's ONE right-column action, so DetailPageShell
    // moves it into the header instead of a lone-button "Hành động" card
    // (spec #179 §3.5).
    expect(screen.queryByText("Hành động")).not.toBeInTheDocument();

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
    // I082 = C012 (the first b3, Chung cư Mini Lê Duẩn, contract)'s kỳ 08,
    // UNPAID (AUGUST_STATUS[11]) — nothing paid yet, so "còn phải trả" is the
    // full total and VietQR still renders; b3 deliberately has no bankAccount.
    renderInvoice("I082");

    await user.click(
      await screen.findByRole("button", { name: "Thanh toán VietQR" }),
    );

    expect(
      await screen.findByText(
        "Toà nhà chưa khai Tài khoản nhận tiền — chưa thể tạo mã VietQR.",
      ),
    ).toBeInTheDocument();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Đi tới Cài đặt Toà nhà" }),
    ).toHaveAttribute("href", "/buildings/b3");
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
    dueDate: "2099-01-31",
    status: "UNPAID",
    paymentDate: null,
    lastUpdated: "2099-01-01",
  };

  it("Ghi nhận thu n đ điền sẵn còn lại — 2 tr rồi hết còn lại → Thu một phần rồi Đã thu", async () => {
    if (!mockInvoices.some((invoice) => invoice.id === paymentTestInvoice.id)) {
      mockInvoices.push({ ...paymentTestInvoice });
    }
    const user = userEvent.setup();
    renderInvoice("I-test-payment");

    // First open: prefilled with the full 4.500.000 còn lại.
    await user.click(
      await screen.findByRole("button", { name: /^Ghi nhận thu 4\.500\.000/ }),
    );
    const firstAmount = await screen.findByLabelText(/Số tiền/);
    expect(firstAmount).toHaveValue(4_500_000);
    await user.clear(firstAmount);
    await user.type(firstAmount, "2000000");
    await user.click(screen.getByRole("button", { name: "Lưu lại" }));

    expect(await screen.findByText("Thu một phần")).toBeInTheDocument();
    expect(
      screen.getByRole("tab", { name: "Thanh toán (1)" }),
    ).toBeInTheDocument();

    // Second open: prefilled with the NEW còn lại (2.500.000) — one click,
    // no retyping, exactly what "một chạm" means here.
    await user.click(
      screen.getByRole("button", { name: /^Ghi nhận thu 2\.500\.000/ }),
    );
    expect(await screen.findByLabelText(/Số tiền/)).toHaveValue(2_500_000);
    await user.click(screen.getByRole("button", { name: "Lưu lại" }));

    expect(await screen.findByText("Đã thu")).toBeInTheDocument();
    expect(
      screen.getByRole("tab", { name: "Thanh toán (2)" }),
    ).toBeInTheDocument();
    // Nothing left to collect — the primary button disappears entirely.
    expect(
      screen.queryByRole("button", { name: /^Ghi nhận thu/ }),
    ).not.toBeInTheDocument();
  });

  it("has no 'Tóm tắt' sidebar card, and meta reads 'Phòng 102' — never 'Phòng Phòng 102'", async () => {
    renderInvoice("I071");

    expect(await screen.findByText("Phòng 102")).toBeInTheDocument();
    expect(screen.queryByText("Tóm tắt")).not.toBeInTheDocument();
    expect(screen.queryByText(/Phòng Phòng/)).not.toBeInTheDocument();
  });

  it("shows 'Còn lại' on the Thanh toán tab, and 'Tổng cộng' only once on Tổng quan", async () => {
    renderInvoice("I071");

    expect(await screen.findByText("Tổng cộng")).toBeInTheDocument();

    await userEvent
      .setup()
      .click(screen.getByRole("tab", { name: /Thanh toán/ }));
    expect(await screen.findByText("Còn lại")).toBeInTheDocument();
  });

  // A dedicated invoice, never reused by another test — "Đã nhận" mutates
  // the shared Mock in place (same as the payment test above), and I071's
  // own unpaid state is other tests' business.
  const vietQrTestInvoice: Invoice = {
    ...paymentTestInvoice,
    id: "I-test-vietqr",
    invoiceNumber: "HÓA-TEST-QR",
    amount: 1_500_000,
    lineItems: [
      {
        type: "RENT",
        description: "Tiền phòng",
        quantity: 1,
        unitPrice: 1_500_000,
        amount: 1_500_000,
      },
    ],
  };

  it("VietQR 'Đã nhận n đ' ghi một Thanh toán chuyển khoản hôm nay và ẩn cả hai nút khi hết còn lại", async () => {
    if (!mockInvoices.some((invoice) => invoice.id === vietQrTestInvoice.id)) {
      mockInvoices.push({ ...vietQrTestInvoice });
    }
    const user = userEvent.setup();
    renderInvoice("I-test-vietqr");

    await user.click(
      await screen.findByRole("button", { name: "Thanh toán VietQR" }),
    );
    await user.click(
      await screen.findByRole("button", { name: /^Đã nhận 1\.500\.000/ }),
    );

    expect(await screen.findByText("Đã thu")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Thanh toán VietQR" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /^Ghi nhận thu/ }),
    ).not.toBeInTheDocument();
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
