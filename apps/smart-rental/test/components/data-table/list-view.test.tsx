import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import { describe, expect, it } from "vitest";

import { useListView } from "~/components/data-table/list-view";

function Subject({ defaultView }: { defaultView?: "grid" | "table" }) {
  const [view, setView] = useListView(defaultView);
  return (
    <div>
      <span>view: {view}</span>
      <button type="button" onClick={() => setView("grid")}>
        Dạng thẻ
      </button>
      <button type="button" onClick={() => setView("table")}>
        Dạng bảng
      </button>
    </div>
  );
}

function renderAt(search: string, defaultView?: "grid" | "table") {
  const router = createMemoryRouter(
    [{ path: "/", element: <Subject defaultView={defaultView} /> }],
    { initialEntries: [`/${search}`] },
  );
  render(<RouterProvider router={router} />);
  return router;
}

describe("useListView", () => {
  it("defaults to table with no `?view=` and no explicit default", () => {
    renderAt("");

    expect(screen.getByText("view: table")).toBeInTheDocument();
  });

  it("honors an explicit default — Phòng keeps grid", () => {
    renderAt("", "grid");

    expect(screen.getByText("view: grid")).toBeInTheDocument();
  });

  it("reads an explicit `?view=` over either default", () => {
    renderAt("?view=grid");

    expect(screen.getByText("view: grid")).toBeInTheDocument();
  });

  it("writes the non-default view to the URL, and drops it back at the default", async () => {
    const user = userEvent.setup();
    const router = renderAt("");

    await user.click(screen.getByRole("button", { name: "Dạng thẻ" }));
    expect(router.state.location.search).toBe("?view=grid");

    await user.click(screen.getByRole("button", { name: "Dạng bảng" }));
    expect(router.state.location.search).toBe("");
  });
});
