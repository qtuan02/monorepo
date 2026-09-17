import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryRouter, RouterProvider } from "react-router";
import { beforeEach, describe, expect, it } from "vitest";

import SearchDialog from "~/features/layout/components/header/search-dialog";
import { useBuildingStore } from "~/stores/use-building-store";

const initialBuildingState = useBuildingStore.getState();

function renderDialog() {
  const router = createMemoryRouter([{ path: "*", element: <SearchDialog /> }]);
  render(
    <QueryClientProvider client={new QueryClient()}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );
  return router;
}

// userEvent types through the command palette one key at a time and the palette
// filters the whole Mock on each keystroke, so under a full parallel run these
// cases pass 5s while passing in ~1s alone.
describe("SearchDialog", { timeout: 20_000 }, () => {
  beforeEach(() => {
    useBuildingStore.setState(initialBuildingState, true);
  });

  it("opens on Ctrl+K with the quick links, then switches to real Mock results on a query", async () => {
    const user = userEvent.setup();
    renderDialog();

    await user.keyboard("{Control>}k{/Control}");
    expect(await screen.findByText("Truy cập nhanh")).toBeInTheDocument();

    await user.keyboard("Nguyễn Văn A");
    expect(screen.queryByText("Truy cập nhanh")).not.toBeInTheDocument();
    expect(await screen.findByText("Người thuê")).toBeInTheDocument();
    expect(screen.getAllByText("Nguyễn Văn A").length).toBeGreaterThan(0);
  });

  it("says so when nothing matches", async () => {
    const user = userEvent.setup();
    renderDialog();

    await user.click(screen.getByRole("button", { name: "Tìm kiếm" }));
    await user.keyboard("zzzz-không-tồn-tại");

    expect(
      await screen.findByText("Không tìm thấy kết quả"),
    ).toBeInTheDocument();
  });

  it("navigates to the selected result's own route", async () => {
    const user = userEvent.setup();
    const router = renderDialog();

    await user.click(screen.getByRole("button", { name: "Tìm kiếm" }));
    await user.keyboard("HÓA-071");
    await user.click(await screen.findByText("Hoá đơn HÓA-071"));

    expect(router.state.location.pathname).toBe("/invoices/I071");
  });
});
