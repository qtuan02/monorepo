import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { createMemoryRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import { beforeEach, describe, expect, it } from "vitest";

import { mockContracts } from "~/constants/mock/contracts";
import { mockInvoices } from "~/constants/mock/invoices";
import { mockRooms } from "~/constants/mock/rooms";
import DashboardTemplate from "~/features/dashboard/templates/dashboard.template";
import { useBuildingStore } from "~/stores/use-building-store";
import { formatCurrency } from "~/utils/currency";
import { buildTodaySummary } from "~/utils/dashboard-summary";
import { formatFullDate } from "~/utils/date";

const initialBuildingState = useBuildingStore.getState();

function renderDashboard() {
  const router = createMemoryRouter(
    [{ path: "*", element: <DashboardTemplate /> }],
    { initialEntries: ["/"] },
  );
  render(
    <QueryClientProvider client={new QueryClient()}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );
}

// `formatCurrency`'s NBSP-before-"₫" pitfall — see `test/pages/main.test.tsx`'s
// own comment on the same trap.
const NBSP = String.fromCharCode(160);
function withoutNbsp(text: string) {
  return text.split(NBSP).join(" ");
}

function scope<T extends { buildingId?: string }>(
  list: T[],
  buildingId: string | null,
): T[] {
  return buildingId
    ? list.filter((item) => item.buildingId === buildingId)
    : list;
}

// The expected numbers are computed through the same `buildTodaySummary` the
// hook calls — never hand-derived here, since re-deriving OVERDUE/PARTIAL by
// eye is exactly the trap ADR-0012's own tests warn about.
function expectedSummary(buildingId: string | null) {
  return buildTodaySummary({
    invoices: scope(mockInvoices, buildingId),
    contracts: scope(mockContracts, buildingId),
    rooms: scope(mockRooms, buildingId),
  });
}

describe("DashboardTemplate", () => {
  beforeEach(() => {
    useBuildingStore.setState(initialBuildingState, true);
  });

  it("names the day and reads the totals under «mọi Toà nhà»", async () => {
    const expected = expectedSummary(null);
    renderDashboard();

    expect(
      screen.getByRole("heading", { level: 1, name: formatFullDate() }),
    ).toBeInTheDocument();
    expect(
      await screen.findAllByText(
        withoutNbsp(formatCurrency(expected.dueThisMonth.amount)),
      ),
    ).not.toHaveLength(0);
    expect(
      screen.getAllByText(`${expected.overdue.count} Hoá đơn`),
    ).not.toHaveLength(0);
  });

  it("reads one Toà nhà's slice once the Building scope changes", async () => {
    useBuildingStore.setState({ selectedBuildingId: "b2" });
    const expectedAll = expectedSummary(null);
    const expectedB2 = expectedSummary("b2");
    renderDashboard();

    expect(
      await screen.findAllByText(`${expectedB2.overdue.count} Hoá đơn`),
    ).not.toHaveLength(0);
    if (expectedB2.overdue.count !== expectedAll.overdue.count) {
      expect(
        screen.queryByText(`${expectedAll.overdue.count} Hoá đơn`),
      ).not.toBeInTheDocument();
    }
  });

  it("shows the Việc cần làm queue with a navigating action", async () => {
    renderDashboard();

    expect(
      await screen.findAllByText(/^Hoá đơn HÓA-\d+ quá hạn$/),
    ).not.toHaveLength(0);
    expect(screen.getAllByRole("link", { name: "Xem" }).length).toBeGreaterThan(
      0,
    );
  });
});
