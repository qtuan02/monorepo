import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";

import CycleTemplate from "~/features/cycles/templates/cycle.template";
import { queryClient } from "~/libs/query-client";
import { useBuildingStore } from "~/stores/use-building-store";

const initialBuildingState = useBuildingStore.getState();

// The app's own `queryClient` singleton, cleared per render — not a bare
// `new QueryClient()` — because ADR-0015 §3 moved every mutation's cache
// invalidation onto that singleton's global `MutationCache.onSuccess`.
function renderTemplate(month = "2026-09") {
  queryClient.clear();
  render(
    <QueryClientProvider client={queryClient}>
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

  // Ticket #183, ADR-0013 — from here on, every test mutates the live Mock
  // (Duyệt, Sửa chỉ số cũ), so they run last and never assume the counts
  // above still hold afterwards.
  it("Duyệt điện on Phòng 103 (bất thường) clears its reason and folds it into READY", async () => {
    const user = userEvent.setup();
    useBuildingStore.setState(
      { ...initialBuildingState, selectedBuildingId: "b1" },
      true,
    );
    renderTemplate();

    const anomalousRow = await screen.findByRole("row", {
      name: /^Phòng 103\b/,
    });
    expect(within(anomalousRow).getByText("Bất thường")).toBeInTheDocument();
    // Nước was never flagged for this Phòng — only điện gets a Duyệt button.
    expect(
      within(anomalousRow).queryByRole("button", { name: "Duyệt nước" }),
    ).not.toBeInTheDocument();

    await user.click(
      within(anomalousRow).getByRole("button", { name: "Duyệt điện" }),
    );

    const readyRow = await screen.findByRole("row", { name: /^Phòng 103\b/ });
    expect(within(readyRow).getByText("Sẵn sàng")).toBeInTheDocument();
    expect(
      within(readyRow).queryByRole("button", { name: "Duyệt điện" }),
    ).not.toBeInTheDocument();
    // 103 joined the previously-3 READY rows.
    expect(
      await screen.findByRole("button", { name: "Lập 4 hoá đơn" }),
    ).toBeInTheDocument();
  });

  it("Sửa chỉ số cũ điện corrects Phòng 102's chỉ số cũ and recomputes tiêu thụ", async () => {
    const user = userEvent.setup();
    useBuildingStore.setState(
      { ...initialBuildingState, selectedBuildingId: "b1" },
      true,
    );
    renderTemplate();

    const row = await screen.findByRole("row", { name: /^Phòng 102\b/ });
    await user.click(
      within(row).getByRole("button", {
        name: "Sửa chỉ số điện cũ phòng Phòng 102",
      }),
    );

    const oldIndexInput = await screen.findByLabelText("Chỉ số điện cũ mới");
    await user.clear(oldIndexInput);
    await user.type(oldIndexInput, "9999");
    await user.type(
      await screen.findByLabelText("Ghi chú"),
      "Thay công tơ điện",
    );
    await user.click(screen.getByRole("button", { name: "Lưu lại" }));

    const correctedRow = await screen.findByRole("row", {
      name: /^Phòng 102\b/,
    });
    expect(within(correctedRow).getByText("9999")).toBeInTheDocument();
  });

  it("chặn hẳn a chỉ số mới thấp hơn chỉ số cũ — lỗi inline, Lưu nháp không nhận", async () => {
    const user = userEvent.setup();
    useBuildingStore.setState(
      { ...initialBuildingState, selectedBuildingId: "b1" },
      true,
    );
    renderTemplate();

    const input = await screen.findByRole("spinbutton", {
      name: "Chỉ số điện mới phòng Phòng 102",
    });
    await user.clear(input);
    await user.type(input, "0");
    await user.click(screen.getByRole("button", { name: "Lưu nháp chỉ số" }));

    expect(
      await screen.findByText(/Chỉ số mới phải ≥ chỉ số cũ/),
    ).toBeInTheDocument();
  });

  it("khoá hoàn toàn một Kỳ tương lai — không ô nhập, không nút hành động", async () => {
    useBuildingStore.setState(
      { ...initialBuildingState, selectedBuildingId: "b1" },
      true,
    );
    renderTemplate("2026-12");

    expect(
      await screen.findByRole("heading", {
        level: 1,
        name: "Kỳ 12/2026 · Trọ Sinh Viên Xanh",
      }),
    ).toBeInTheDocument();
    expect(
      await screen.findByText("Kỳ tương lai — chưa mở."),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /Lưu nháp chỉ số/ }),
    ).not.toBeInTheDocument();
    expect(screen.queryAllByRole("spinbutton")).toHaveLength(0);
  });
});
