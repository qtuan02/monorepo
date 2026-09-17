import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import BuildingFormSheet from "~/features/buildings/components/building-form-sheet";

function renderSheet() {
  const queryClient = new QueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <BuildingFormSheet open onOpenChange={() => {}} />
    </QueryClientProvider>,
  );
}

describe("BuildingFormSheet", () => {
  it("marks every required field with an asterisk", () => {
    renderSheet();

    for (const label of [
      "Tên toà nhà",
      "Địa chỉ",
      "Số tầng",
      "Ngày chốt điện nước",
    ]) {
      const field = screen.getByText(label).closest('[data-slot="field"]');
      expect(field).not.toBeNull();
      expect(within(field as HTMLElement).getByText("*")).toBeInTheDocument();
    }
    // "Ghi chú" is optional — no asterisk.
    const note = screen.getByText("Ghi chú").closest('[data-slot="field"]');
    expect(
      within(note as HTMLElement).queryByText("*"),
    ).not.toBeInTheDocument();
  });

  it("shows the error under the field, wired by aria-describedby, on submit", async () => {
    const user = userEvent.setup();
    renderSheet();

    await user.click(screen.getByRole("button", { name: "Lưu lại" }));

    const nameInput = await screen.findByLabelText(/Tên toà nhà/);
    const describedBy = nameInput.getAttribute("aria-describedby");
    expect(describedBy).toBeTruthy();
    expect(document.getElementById(describedBy ?? "")).toHaveTextContent(
      "Tên toà nhà phải có ít nhất 2 ký tự",
    );
    expect(nameInput).toHaveAttribute("aria-invalid", "true");
  });
});
