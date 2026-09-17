import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import DashboardTemplate from "~/features/dashboard/templates/dashboard.template";
import { useBuildingStore } from "~/stores/use-building-store";

// The real store, driven through its own API — the Building scope is what
// this screen is a function of.
const initialBuildingState = useBuildingStore.getState();

function renderDashboard() {
  render(
    <QueryClientProvider client={new QueryClient()}>
      <DashboardTemplate />
    </QueryClientProvider>,
  );
}

// "Hôm nay" now reads off `~/constants/mock/{rooms,invoices,expenses}`
// (ADR-0012) rather than a fixed `mockDashboard` — the totals here are
// derived by hand from those Mocks (18 Phòng, 14 occupied; the kỳ 09 total
// per Hợp đồng), not copied from the hook.
describe("DashboardTemplate", () => {
  beforeEach(() => {
    useBuildingStore.setState(initialBuildingState, true);
  });

  it("reads the totals under «mọi Toà nhà»", async () => {
    renderDashboard();

    expect(
      screen.getByRole("heading", { level: 1, name: "Hôm nay" }),
    ).toBeInTheDocument();
    expect(await screen.findByText("18")).toBeInTheDocument();
    expect(screen.getByText("77.8%")).toBeInTheDocument();
    expect(screen.getByText("66.6tr")).toBeInTheDocument();
  });

  it("reads one Toà nhà's slice once the Building scope changes", async () => {
    useBuildingStore.setState({ selectedBuildingId: "b1" });
    renderDashboard();

    expect(await screen.findByText("6")).toBeInTheDocument();
    expect(screen.getByText("16.4tr")).toBeInTheDocument();
    expect(screen.queryByText("18")).not.toBeInTheDocument();
  });

  it("switches the chart card between Doanh thu and Thu vs Chi", async () => {
    renderDashboard();
    await screen.findByText("18");

    expect(
      screen.getByRole("tab", { name: "Doanh thu", selected: true }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("tab", { name: "Thu vs Chi", selected: false }),
    ).toBeInTheDocument();
  });
});
