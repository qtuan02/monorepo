import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import ExpenseFormSheet from "~/features/expenses/components/expense-form-sheet";

function renderSheet() {
  const queryClient = new QueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <ExpenseFormSheet open onOpenChange={() => {}} />
    </QueryClientProvider>,
  );
}

describe("ExpenseFormSheet", () => {
  it("titles the sheet for a create flow when no expense is handed in", () => {
    renderSheet();
    expect(
      screen.getByRole("heading", { name: "Thêm khoản chi" }),
    ).toBeInTheDocument();
  });

  it("marks the required fields with an asterisk", () => {
    renderSheet();

    for (const label of ["Toà nhà", "Danh mục", "Số tiền", "Ngày chi"]) {
      const field = screen.getByText(label).closest('[data-slot="field"]');
      expect(field).not.toBeNull();
      expect(within(field as HTMLElement).getByText("*")).toBeInTheDocument();
    }
  });

  it("shows the error under the field, wired by aria-describedby, on submit", async () => {
    const user = userEvent.setup();
    renderSheet();

    await user.click(screen.getByRole("button", { name: "Lưu lại" }));

    const categoryInput = await screen.findByLabelText(/Danh mục/);
    const describedBy = categoryInput.getAttribute("aria-describedby");
    expect(describedBy).toBeTruthy();
    expect(document.getElementById(describedBy ?? "")).toHaveTextContent(
      "Nhập danh mục",
    );
    expect(categoryInput).toHaveAttribute("aria-invalid", "true");
  });

  it("shows no attachment preview until a URL is typed", async () => {
    const user = userEvent.setup();
    renderSheet();

    expect(screen.queryByText("Biên lai")).not.toBeInTheDocument();

    await user.type(
      screen.getByLabelText("Ảnh biên lai"),
      "https://example.com/receipt.png",
    );

    expect(screen.getByText("Biên lai")).toBeInTheDocument();
  });
});
