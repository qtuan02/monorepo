import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import RoomFormSheet from "~/features/rooms/components/room-form-sheet";

function renderSheet() {
  const queryClient = new QueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <RoomFormSheet open onOpenChange={() => {}} />
    </QueryClientProvider>,
  );
}

describe("RoomFormSheet", () => {
  it("titles the sheet for a create flow when no room is handed in", () => {
    renderSheet();
    expect(
      screen.getByRole("heading", { name: "Thêm phòng mới" }),
    ).toBeInTheDocument();
  });

  it("marks the required fields with an asterisk", () => {
    renderSheet();

    for (const label of ["Toà nhà", "Tên phòng", "Tầng", "Diện tích (m²)"]) {
      const field = screen.getByText(label).closest('[data-slot="field"]');
      expect(field).not.toBeNull();
      expect(within(field as HTMLElement).getByText("*")).toBeInTheDocument();
    }
  });

  it("shows the error under the field, wired by aria-describedby, on submit", async () => {
    const user = userEvent.setup();
    renderSheet();

    await user.click(screen.getByRole("button", { name: "Lưu lại" }));

    const nameInput = await screen.findByLabelText(/Tên phòng/);
    const describedBy = nameInput.getAttribute("aria-describedby");
    expect(describedBy).toBeTruthy();
    expect(document.getElementById(describedBy ?? "")).toHaveTextContent(
      "Tên phòng phải có ít nhất 1 ký tự",
    );
    expect(nameInput).toHaveAttribute("aria-invalid", "true");
  });
});
