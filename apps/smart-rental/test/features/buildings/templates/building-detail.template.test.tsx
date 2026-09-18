import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import { describe, expect, it } from "vitest";

import BuildingDetailTemplate from "~/features/buildings/templates/building-detail.template";

// The template alone, the two providers it reaches for — a router for
// RoomGrid's links and the back button, a query client for the Mock.
function renderBuilding(buildingId: string) {
  const router = createMemoryRouter(
    [
      {
        path: "*",
        element: <BuildingDetailTemplate buildingId={buildingId} />,
      },
    ],
    { initialEntries: ["/"] },
  );
  render(
    <QueryClientProvider client={new QueryClient()}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );
}

describe("BuildingDetailTemplate", () => {
  it("has exactly one entry to Cài đặt — the tab, not a second header button", async () => {
    renderBuilding("b1");

    await screen.findByRole("tab", { name: "Cài đặt" });
    // No header action duplicates it — only the tab trigger says "Cài đặt".
    expect(screen.getAllByText("Cài đặt")).toHaveLength(1);

    const user = userEvent.setup();
    await user.click(screen.getByRole("tab", { name: "Cài đặt" }));
    // The tab's own "Chỉnh sửa" is the one entry point into the settings sheet.
    expect(
      await screen.findByRole("button", { name: "Chỉnh sửa" }),
    ).toBeInTheDocument();
  });

  it("shows the occupancy rate once, not once as a big number and once on the bar", async () => {
    renderBuilding("b1");

    await screen.findByText("Tỷ lệ lấp đầy");
    // Exactly one node reads "…%" for the rate — the OccupancyBar's own text.
    expect(screen.getAllByText(/^\d+%$/)).toHaveLength(1);
  });
});
