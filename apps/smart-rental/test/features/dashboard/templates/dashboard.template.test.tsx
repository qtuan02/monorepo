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

describe("DashboardTemplate", () => {
  beforeEach(() => {
    useBuildingStore.setState(initialBuildingState, true);
  });

  it("reads the totals under «mọi Toà nhà»", async () => {
    renderDashboard();

    expect(
      screen.getByRole("heading", { level: 1, name: "Tổng quan" }),
    ).toBeInTheDocument();
    expect(await screen.findByText("145")).toBeInTheDocument();
    expect(screen.getByText("545.2tr")).toBeInTheDocument();
    expect(screen.getByText("Sửa vòi nước phòng 108")).toBeInTheDocument();
  });

  it("reads one Toà nhà's slice once the Building scope changes", async () => {
    useBuildingStore.setState({ selectedBuildingId: "b1" });
    renderDashboard();

    expect(await screen.findByText("15")).toBeInTheDocument();
    expect(screen.getByText("54.5tr")).toBeInTheDocument();
    expect(screen.queryByText("145")).not.toBeInTheDocument();
  });

  it("switches the chart card between Doanh thu and Thu vs Chi", async () => {
    renderDashboard();
    await screen.findByText("145");

    expect(
      screen.getByRole("tab", { name: "Doanh thu", selected: true }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("tab", { name: "Thu vs Chi", selected: false }),
    ).toBeInTheDocument();
  });
});
