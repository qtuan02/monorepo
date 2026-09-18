import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, within } from "@testing-library/react";
import { createMemoryRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import { beforeEach, describe, expect, it } from "vitest";

import { mockContracts } from "~/constants/mock/contracts";
import { mockInvoices } from "~/constants/mock/invoices";
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

function scope<T extends { buildingId?: string }>(
  list: T[],
  buildingId: string | null,
): T[] {
  return buildingId
    ? list.filter((item) => item.buildingId === buildingId)
    : list;
}

// `formatCurrency`'s NBSP-before-"₫" pitfall — see `test/pages/main.test.tsx`'s
// own comment on the same trap: RTL's default text normalizer normalizes the
// ELEMENT's own text before comparing (NBSP collapses to a plain space), but
// never the query string, so a raw NBSP in the query never matches.
const NBSP = String.fromCharCode(160);
function withoutNbsp(text: string) {
  return text.split(NBSP).join(" ");
}

// The expected numbers are computed through the same `buildTodaySummary` the
// hook calls — never hand-derived here, since re-deriving OVERDUE/PARTIAL by
// eye is exactly the trap ADR-0012's own tests warn about.
function expectedSummary(buildingId: string | null) {
  return buildTodaySummary({
    invoices: scope(mockInvoices, buildingId),
    contracts: scope(mockContracts, buildingId),
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
        withoutNbsp(formatCurrency(expected.outstandingThisMonth.amount)),
      ),
    ).not.toHaveLength(0);
  });

  it("reads one Toà nhà's slice once the Building scope changes", async () => {
    useBuildingStore.setState({ selectedBuildingId: "b2" });
    const expectedB2 = expectedSummary("b2");
    renderDashboard();

    expect(
      await screen.findAllByText(
        withoutNbsp(formatCurrency(expectedB2.outstandingThisMonth.amount)),
      ),
    ).not.toHaveLength(0);
  });

  it("shows the Việc cần làm queue gộp — a merged Hoá đơn quá hạn mục", async () => {
    useBuildingStore.setState({ selectedBuildingId: "b1" });
    renderDashboard();

    expect(await screen.findAllByText(/Hoá đơn quá hạn/)).not.toHaveLength(0);
  });

  // AC: "KPI 3 ô, hai ô đầu không bao giờ cùng số" — the old bug was two
  // SEPARATE tiles ("Cần thu tháng này" / "Quá hạn") landing on the same
  // amount; merging them into one tile's own dòng phụ makes that
  // structurally impossible, but this pins it against the rendered strip.
  it("renders 3 KPI tiles whose own values never coincide", async () => {
    useBuildingStore.setState({ selectedBuildingId: "b1" });
    renderDashboard();

    const strip = await screen
      .findByText("Còn phải thu tháng này")
      .then((label) => label.closest('[data-slot="kpi-strip"]') as HTMLElement);
    const values = within(strip)
      .getAllByText(/./, { selector: "p.text-xl" })
      .map((el) => el.textContent);

    expect(values).toHaveLength(3);
    expect(new Set(values).size).toBe(3);
  });
});
