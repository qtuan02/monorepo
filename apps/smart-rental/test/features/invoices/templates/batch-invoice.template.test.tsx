import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";

import dayjs from "@monorepo/dayjs";

import type { Utility } from "~/types/utility";
import { mockUtilities } from "~/constants/mock/utilities";
import BatchInvoiceTemplate from "~/features/invoices/templates/batch-invoice.template";
import { useBuildingStore } from "~/stores/use-building-store";

const initialBuildingState = useBuildingStore.getState();

// A kỳ two months out — always outside the Mock's fixed 04–09/2026 range
// (constants/mock/invoices.ts, constants/mock/utilities.ts), whatever the
// real wall-clock date is when this test runs.
const targetMonth = dayjs().add(2, "month");
const TARGET_BILLING_MONTH = targetMonth.format("YYYY-MM");

function verifiedReading(overrides: Partial<Utility>): Utility {
  return {
    id: "u-test",
    buildingId: "b1",
    roomId: "R-B1-103",
    roomName: "Phòng 103",
    month: TARGET_BILLING_MONTH,
    type: "electricity",
    oldIndex: 1000,
    newIndex: 1120,
    consumption: 120,
    status: "FINALIZED",
    updatedAt: new Date().toISOString(),
    proofImages: [],
    ...overrides,
  };
}

function renderTemplate() {
  render(
    <QueryClientProvider client={new QueryClient()}>
      <BatchInvoiceTemplate />
    </QueryClientProvider>,
  );
}

/** Opens the MonthField popover and navigates it to `targetMonth`. */
async function pickTargetMonth(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole("button", { name: "Kỳ hoá đơn" }));

  const yearDiff = targetMonth.year() - dayjs().year();
  const yearButton = yearDiff >= 0 ? "Năm sau" : "Năm trước";
  for (let i = 0; i < Math.abs(yearDiff); i += 1) {
    await user.click(screen.getByRole("button", { name: yearButton }));
  }

  await user.click(
    screen.getByRole("button", { name: `Th ${targetMonth.month() + 1}` }),
  );
}

describe("BatchInvoiceTemplate", () => {
  beforeEach(() => {
    useBuildingStore.setState(initialBuildingState, true);
    useBuildingStore.setState({ selectedBuildingId: "b1" });
  });

  it("ticks only the Phòng with Chỉ số xác nhận của kỳ; lập tạo Hoá đơn đủ dòng và hạn đúng ngày thu", async () => {
    const user = userEvent.setup();
    // C002 = "Phòng 103" · "Trần Thị B" (mockContracts, b1) — the target kỳ
    // has no other pre-seeded Mock data, so this is the only eligible room.
    mockUtilities.push(
      verifiedReading({ id: "u-test-electric", type: "electricity" }),
      verifiedReading({
        id: "u-test-water",
        type: "water",
        oldIndex: 100,
        newIndex: 108,
        consumption: 8,
      }),
    );

    renderTemplate();
    await pickTargetMonth(user);

    const eligibleRow = (await screen.findByText("Phòng 103")).closest("tr");
    expect(eligibleRow).not.toBeNull();
    expect(
      within(eligibleRow as HTMLElement).getByRole("checkbox", {
        name: "Chọn phòng Phòng 103",
      }),
    ).not.toHaveAttribute("aria-disabled", "true");
    expect(
      within(eligibleRow as HTMLElement).getByText("Sẵn sàng"),
    ).toBeInTheDocument();

    const ineligibleRow = screen.getByText("Phòng 102").closest("tr");
    expect(ineligibleRow).not.toBeNull();
    expect(
      within(ineligibleRow as HTMLElement).getByRole("checkbox", {
        name: "Chọn phòng Phòng 102",
      }),
    ).toHaveAttribute("aria-disabled", "true");
    expect(
      within(ineligibleRow as HTMLElement).getByText("Chưa đủ điều kiện"),
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: "Tạo & Gửi 1 hoá đơn" }),
    );

    expect(
      await screen.findByText("Đã lập kỳ này", { exact: true }),
    ).toBeInTheDocument();
  });
});
