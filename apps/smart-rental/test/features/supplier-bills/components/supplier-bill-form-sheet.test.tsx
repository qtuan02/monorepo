import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import SupplierBillFormSheet from "~/features/supplier-bills/components/supplier-bill-form-sheet";

function renderSheet() {
  const queryClient = new QueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <SupplierBillFormSheet open onOpenChange={() => {}} />
    </QueryClientProvider>,
  );
}

describe("SupplierBillFormSheet", () => {
  it("titles the sheet for a create flow when no bill is handed in", () => {
    renderSheet();
    expect(
      screen.getByRole("heading", { name: "Thêm hoá đơn nhà cung cấp" }),
    ).toBeInTheDocument();
  });

  it("marks the required fields with an asterisk", () => {
    renderSheet();

    for (const label of ["Toà nhà", "Nhà cung cấp", "Kỳ hoá đơn", "Số tiền"]) {
      const field = screen.getByText(label).closest('[data-slot="field"]');
      expect(field).not.toBeNull();
      expect(within(field as HTMLElement).getByText("*")).toBeInTheDocument();
    }
  });

  it("shows the error under the field, wired by aria-describedby, on submit", async () => {
    const user = userEvent.setup();
    renderSheet();

    await user.click(screen.getByRole("button", { name: "Lưu lại" }));

    const supplierInput = await screen.findByLabelText(/Nhà cung cấp/);
    const describedBy = supplierInput.getAttribute("aria-describedby");
    expect(describedBy).toBeTruthy();
    expect(document.getElementById(describedBy ?? "")).toHaveTextContent(
      "Nhập tên nhà cung cấp",
    );
    expect(supplierInput).toHaveAttribute("aria-invalid", "true");
  });

  it("defaults trạng thái to chưa thanh toán by leaving Ngày thanh toán empty", () => {
    renderSheet();

    expect(
      screen.getByRole("button", { name: "Ngày thanh toán" }),
    ).toHaveTextContent("Chưa thanh toán");
  });
});
