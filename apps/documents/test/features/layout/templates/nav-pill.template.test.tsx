import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";

import NavPillTemplate from "~/features/layout/templates/nav-pill.template";
import { ThemeProvider } from "~/libs/theme-provider";

function renderPill() {
  return render(
    <ThemeProvider>
      <MemoryRouter>
        <NavPillTemplate />
      </MemoryRouter>
    </ThemeProvider>,
  );
}

describe("the phone sheet menu", () => {
  it("shows the four controls as text labels, not just round icons", async () => {
    const user = userEvent.setup();
    renderPill();

    expect(screen.queryByText("Xem trên npm")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Mở menu" }));

    for (const label of [
      "Chọn ngôn ngữ",
      "Chuyển sang giao diện tối",
      "Xem trên npm",
      "Mở Storybook",
    ]) {
      expect(screen.getByText(label)).toBeInTheDocument();
    }
  });
});
