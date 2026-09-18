import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import dayjs from "@monorepo/dayjs";

import { mockBuildings } from "~/constants/mock/buildings";
import { mockExpenses } from "~/constants/mock/expenses";
import ReconciliationTemplate from "~/features/reconciliation/templates/reconciliation.template";
import { useCreateExpense } from "~/hooks/api/expense";
import { queryClient } from "~/libs/query-client";
import { useBuildingStore } from "~/stores/use-building-store";
import { formatCurrency } from "~/utils/currency";

const NBSP = String.fromCharCode(160);
function withoutNbsp(text: string) {
  return text.split(NBSP).join(" ");
}

const initialBuildingState = useBuildingStore.getState();

/** The one button this test needs — a raw call to the mutation under test. */
function CreateExpenseButton() {
  const createExpense = useCreateExpense();
  return (
    <button
      type="button"
      onClick={() =>
        createExpense.mutate({
          buildingId: "b1",
          category: "Kiểm thử",
          amount: 999_000,
          expenseDate: dayjs().format("YYYY-MM-DD"),
        })
      }
    >
      Thêm chi phí kiểm thử
    </button>
  );
}

/**
 * Ticket #165 AC: "Thêm một Chi phí → Đối soát cùng kỳ đổi tổng chi ngay
 * (in-memory)". The app's own `queryClient` singleton, shared by both — the
 * global `MutationCache.onSuccess` (ADR-0015 §3) invalidating everything is
 * exactly what this proves; two separate `renderAt` calls would each start a
 * fresh cache and could never catch a missing invalidation.
 */
describe("Chi phí → Đối soát cập nhật ngay", () => {
  beforeEach(() => {
    useBuildingStore.setState({ selectedBuildingId: "b1" });
    queryClient.clear();
  });

  afterEach(() => {
    useBuildingStore.setState(initialBuildingState);
    // The mutation writes straight into the module-level Mock — undo it so a
    // later test file importing the same singleton starts from the fixture.
    const testIndex = mockExpenses.findIndex(
      (expense) => expense.category === "Kiểm thử",
    );
    if (testIndex !== -1) mockExpenses.splice(testIndex, 1);
  });

  it("reflects a new Chi phí in the same kỳ's Tổng chi with no reload", async () => {
    const user = userEvent.setup();
    const router = createMemoryRouter(
      [
        {
          path: "*",
          element: (
            <>
              <ReconciliationTemplate />
              <CreateExpenseButton />
            </>
          ),
        },
      ],
      { initialEntries: ["/"] },
    );
    render(
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>,
    );

    const totalLabel = await screen.findByText("Tổng chi dịch vụ");
    const before = totalLabel.nextElementSibling?.textContent ?? "";
    const beforeAmount = Number(before.replace(/\D/g, ""));
    const expected = withoutNbsp(formatCurrency(beforeAmount + 999_000));

    await user.click(
      screen.getByRole("button", { name: "Thêm chi phí kiểm thử" }),
    );

    // No reload, no second render — the same QueryClient's cache updated in
    // place once the global `MutationCache.onSuccess` invalidated every
    // query, including the one this screen is already watching.
    expect(await screen.findAllByText(expected)).not.toHaveLength(0);
  });
});

/**
 * Spec-axis review of #165 caught this: deriving the block list from the
 * *returned* items dropped a Toà nhà with neither income nor expense in the
 * picked kỳ, breaking "mỗi Toà nhà một khối" (spec #153 §10 row 11) for any
 * kỳ the Mock doesn't cover.
 */
describe("mỗi Toà nhà một khối — kể cả không có dữ liệu", () => {
  beforeEach(() => {
    useBuildingStore.setState({ selectedBuildingId: null });
  });

  afterEach(() => {
    useBuildingStore.setState(initialBuildingState);
  });

  it("still renders every Toà nhà's block for a kỳ the Mock has nothing in", async () => {
    const user = userEvent.setup();
    const router = createMemoryRouter(
      [{ path: "*", element: <ReconciliationTemplate /> }],
      { initialEntries: ["/"] },
    );
    render(
      <QueryClientProvider client={new QueryClient()}>
        <RouterProvider router={router} />
      </QueryClientProvider>,
    );

    await user.click(
      await screen.findByRole("button", { name: "Chọn kỳ đối soát" }),
    );
    // The Mock covers only 2026 — a year back is guaranteed empty everywhere.
    await user.click(screen.getByRole("button", { name: "Năm trước" }));
    await user.click(screen.getByRole("button", { name: "Th 4" }));

    for (const building of mockBuildings) {
      const heading = await screen.findByRole("heading", {
        name: building.name,
      });
      expect(
        within(heading.parentElement as HTMLElement).getByText(
          "Không có dữ liệu đối soát",
        ),
      ).toBeInTheDocument();
    }
  });
});
