import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import { describe, expect, it } from "vitest";

import { createDataTableColumnHelper } from "@monorepo/ui/components/data-table";

import { DataTable, facetFilterFn } from "~/components/data-table/data-table";

type Row = { id: string; name: string; status: "a" | "b" };

// 30 rows, statuses alternating a/b, so 12 per page → three pages.
const rows: Row[] = Array.from({ length: 30 }, (_, i) => ({
  id: `r${i + 1}`,
  name: `Row ${i + 1}`,
  status: i % 2 === 0 ? "a" : "b",
}));

const helper = createDataTableColumnHelper<Row>();
const columns = helper.columns([
  helper.accessor("name", { header: "Tên", filterFn: "includesString" }),
  helper.accessor("status", { header: "Trạng thái", filterFn: facetFilterFn }),
]);

function Subject() {
  return (
    <DataTable
      columns={columns}
      data={rows}
      getRowId={(row) => row.id}
      search={{ columnId: "name", placeholder: "Tìm tên..." }}
      facets={[
        {
          columnId: "status",
          title: "Trạng thái",
          options: [
            { value: "a", label: "A" },
            { value: "b", label: "B" },
          ],
        },
      ]}
      empty={{ title: "Không có gì" }}
      resultLabel={(count) => `${count} dòng`}
    />
  );
}

function renderAt(search: string) {
  const router = createMemoryRouter([{ path: "/", element: <Subject /> }], {
    initialEntries: [`/${search}`],
  });
  render(<RouterProvider router={router} />);
  return router;
}

const cellTexts = () =>
  screen
    .getAllByRole("cell")
    .map((cell) => cell.textContent)
    .filter((text) => text?.startsWith("Row "));

describe("DataTable — URL-owned list state", () => {
  it("reads the page from the URL", () => {
    renderAt("?page=2");

    expect(cellTexts()[0]).toBe("Row 13");
    expect(screen.getByText("13–24")).toBeInTheDocument();
  });

  it("reads the page size from the URL", () => {
    renderAt("?size=24");

    expect(cellTexts()).toHaveLength(24);
  });

  it("reads search and facets from the URL, and says it is filtering", () => {
    renderAt("?q=Row%203&status=a");

    // "Row 3" matches Row 3 (a) and Row 30 (b); the facet keeps only status a.
    expect(cellTexts()).toEqual(["Row 3"]);
    expect(screen.getByText("1 dòng")).toBeInTheDocument();
    expect(screen.getByText("Đang lọc")).toBeInTheDocument();
  });

  it("corrects a page past the end back into range", async () => {
    const router = renderAt("?page=99");

    await waitFor(() => expect(router.state.location.search).toBe("?page=3"));
    await waitFor(() => expect(cellTexts()[0]).toBe("Row 25"));
  });

  it("writes the next page to the URL, replacing history", async () => {
    const user = userEvent.setup();
    const router = renderAt("");

    await user.click(screen.getByRole("button", { name: "Trang sau" }));

    await waitFor(() => expect(router.state.location.search).toBe("?page=2"));
    expect(router.state.historyAction).toBe("REPLACE");
    await waitFor(() => expect(cellTexts()[0]).toBe("Row 13"));
  });

  it("commits a typed search to the URL after the debounce, and back to page 1", async () => {
    // `delay: null` types the five characters with no wait between them, so
    // the 300ms window cannot elapse mid-word on a loaded machine.
    const user = userEvent.setup({ delay: null });
    const router = renderAt("?page=2");

    await user.type(screen.getByRole("searchbox"), "Row 1");

    // Nothing is written per keystroke…
    expect(router.state.location.search).toBe("?page=2");
    // …only once typing settles, and the page resets with it.
    await waitFor(() => expect(router.state.location.search).toBe("?q=Row+1"), {
      timeout: 3000,
    });
    // Row 1, Row 10–19 → 11 rows. The router commits a navigation in a
    // transition, so the URL leads the DOM by a tick — hence `findBy`.
    expect(await screen.findByText("11 dòng")).toBeInTheDocument();
  });

  it("toggles a facet through the URL and clears every filter at once", async () => {
    const user = userEvent.setup();
    const router = renderAt("?q=Row");

    await user.click(screen.getByRole("button", { name: /Trạng thái/ }));
    await user.click(await screen.findByRole("checkbox", { name: /^B/ }));

    await waitFor(
      () => expect(router.state.location.search).toBe("?q=Row&status=b"),
      { timeout: 3000 },
    );
    expect(await screen.findByText("15 dòng")).toBeInTheDocument();

    // The popover carries its own "Xóa bộ lọc"; the toolbar one clears everything.
    await user.keyboard("{Escape}");
    await user.click(screen.getByRole("button", { name: /Xóa bộ lọc/ }));

    await waitFor(() => expect(router.state.location.search).toBe(""), {
      timeout: 3000,
    });
    expect(await screen.findByText("30 dòng")).toBeInTheDocument();
    expect(screen.getByRole("searchbox")).toHaveValue("");
  });

  it("shows the empty panel with a reset when a filter matches nothing", () => {
    renderAt("?q=zzz");

    const empty = screen.getByText("Không có gì").closest("[data-slot=empty]");
    expect(empty).not.toBeNull();
    expect(
      within(empty as HTMLElement).getByRole("button", {
        name: "Xóa toàn bộ bộ lọc",
      }),
    ).toBeInTheDocument();
  });
});
