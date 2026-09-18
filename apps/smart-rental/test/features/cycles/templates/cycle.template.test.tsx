import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";

import CycleTemplate from "~/features/cycles/templates/cycle.template";
import { useBuildingStore } from "~/stores/use-building-store";

const initialBuildingState = useBuildingStore.getState();

function renderTemplate(month = "2026-09") {
  render(
    <QueryClientProvider client={new QueryClient()}>
      <MemoryRouter>
        <CycleTemplate month={month} />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe("CycleTemplate", () => {
  it("renders the kỳ heading, chỉ số mới prefilled from Nháp, and every row status for b1", async () => {
    useBuildingStore.setState(
      { ...initialBuildingState, selectedBuildingId: "b1" },
      true,
    );
    renderTemplate();

    expect(
      await screen.findByRole("heading", {
        level: 1,
        name: "Kỳ 09/2026 · Trọ Sinh Viên Xanh",
      }),
    ).toBeInTheDocument();

    // Phòng 102 is READY — its chỉ số mới arrives pre-filled from the saved
    // Nháp, not an empty field the landlord has to type from scratch.
    const readyRow = await screen.findByRole("row", { name: /^Phòng 102\b/ });
    expect(
      within(readyRow).getByRole("spinbutton", {
        name: "Chỉ số điện mới phòng Phòng 102",
      }),
    ).not.toHaveValue(null);
    expect(within(readyRow).getByText("Sẵn sàng")).toBeInTheDocument();

    // R-B1-103 is the Mock's one deliberately anomalous Phòng of kỳ 09.
    expect(
      within(screen.getByRole("row", { name: /^Phòng 103\b/ })).getByText(
        "Bất thường",
      ),
    ).toBeInTheDocument();
    // R-B1-106 is the Mock's one deliberately unread Phòng of kỳ 09.
    expect(
      within(screen.getByRole("row", { name: /^Phòng 106\b/ })).getByText(
        "Thiếu chỉ số",
      ),
    ).toBeInTheDocument();
    // Phòng 101 is vacant.
    expect(
      within(screen.getByRole("row", { name: /^Phòng 101\b/ })).getByText(
        "Không lập",
      ),
    ).toBeInTheDocument();

    // b1's Bảng giá (3.500 đ/kWh) is genuinely over the legal cap — the
    // Alert has a real Mock case to show, not just the form's live warning.
    expect(
      screen.getByText("Vượt trần giá điện cho người thuê"),
    ).toBeInTheDocument();
  });

  it("counts the READY rows and keeps Lập disabled before the kỳ's ngày chốt", async () => {
    useBuildingStore.setState(
      { ...initialBuildingState, selectedBuildingId: "b1" },
      true,
    );
    renderTemplate();

    // b1's occupied Phòng 102/103/104/105/106, minus the one ANOMALY (103)
    // and the one MISSING (106), leaves exactly 3 READY.
    const submitButton = await screen.findByRole("button", {
      name: "Lập 3 hoá đơn",
    });
    expect(submitButton).toBeDisabled();
    expect(
      screen.getByText(/Chỉ lập được từ sau ngày chốt của kỳ/),
    ).toBeInTheDocument();
  });

  it("shows the Building-scope-required panel with no Toà nhà selected", () => {
    useBuildingStore.setState(initialBuildingState, true);
    renderTemplate();

    expect(
      screen.getByText("Chọn một Toà nhà trước khi tiếp tục"),
    ).toBeInTheDocument();
  });
});
