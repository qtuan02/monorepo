import type { ReactElement } from "react";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import { describe, expect, it, vi } from "vitest";

import {
  createDataTableColumnHelper,
  DataTableColumnHeader,
} from "@monorepo/ui/components/data-table";

import type { DataTableQuery } from "~/components/data-table/data-table";
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

function successQuery<T>(data: T[]): DataTableQuery<T> {
  return { data, isLoading: false, isError: false, refetch: () => {} };
}

function loadingQuery<T>(): DataTableQuery<T> {
  return {
    data: undefined,
    isLoading: true,
    isError: false,
    refetch: () => {},
  };
}

function errorQuery<T>(refetch: () => void): DataTableQuery<T> {
  return { data: undefined, isLoading: false, isError: true, refetch };
}

function Subject() {
  return (
    <DataTable
      columns={columns}
      query={successQuery(rows)}
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
      entityLabel="dòng"
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
    expect(screen.getByText("1 dòng được tìm thấy")).toBeInTheDocument();
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
    expect(
      await screen.findByText("11 dòng được tìm thấy"),
    ).toBeInTheDocument();
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
    expect(
      await screen.findByText("15 dòng được tìm thấy"),
    ).toBeInTheDocument();

    // The popover carries its own "Xóa bộ lọc"; the toolbar one clears everything.
    await user.keyboard("{Escape}");
    await user.click(screen.getByRole("button", { name: /Xóa bộ lọc/ }));

    await waitFor(() => expect(router.state.location.search).toBe(""), {
      timeout: 3000,
    });
    expect(
      await screen.findByText("30 dòng được tìm thấy"),
    ).toBeInTheDocument();
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
    expect(
      within(empty as HTMLElement).getByText(
        "Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm để xem kết quả.",
      ),
    ).toBeInTheDocument();
  });
});

function renderPlain(element: ReactElement) {
  const router = createMemoryRouter([{ path: "/", element }], {
    initialEntries: ["/"],
  });
  render(<RouterProvider router={router} />);
  return router;
}

describe("DataTable — query states", () => {
  it("shows a table skeleton with one cell per column while loading", () => {
    renderPlain(
      <DataTable
        columns={columns}
        query={loadingQuery<Row>()}
        getRowId={(row) => row.id}
        empty={{ title: "Không có gì" }}
      />,
    );

    const skeletonRows = document.querySelectorAll(
      '[data-slot="table-skeleton-row"]',
    );
    expect(skeletonRows.length).toBeGreaterThan(0);
    for (const row of skeletonRows) {
      expect(row.querySelectorAll('[data-slot="skeleton"]')).toHaveLength(
        columns.length,
      );
    }
  });

  it("shows an error panel whose Thử lại calls refetch", async () => {
    const user = userEvent.setup();
    const refetch = vi.fn();
    renderPlain(
      <DataTable
        columns={columns}
        query={errorQuery<Row>(refetch)}
        getRowId={(row) => row.id}
        empty={{ title: "Không có gì" }}
        entityLabel="dòng"
      />,
    );

    expect(
      screen.getByText("Không tải được danh sách dòng."),
    ).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Thử lại" }));
    expect(refetch).toHaveBeenCalledOnce();
  });
});

describe("DataTable — card view", () => {
  it("shows the view switch and renders one card per row once switched to Dạng thẻ", async () => {
    const user = userEvent.setup();
    renderPlain(
      <DataTable
        columns={columns}
        query={successQuery(rows.slice(0, 3))}
        getRowId={(row) => row.id}
        empty={{ title: "Không có gì" }}
        card={(row) => <div data-testid={`card-${row.id}`}>{row.name}</div>}
      />,
    );

    expect(screen.queryByTestId("card-r1")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Dạng thẻ" }));

    expect(screen.getByTestId("card-r1")).toBeInTheDocument();
    expect(screen.getByTestId("card-r2")).toBeInTheDocument();
    expect(screen.getByTestId("card-r3")).toBeInTheDocument();
    expect(screen.queryByRole("cell")).not.toBeInTheDocument();
  });

  it("shows the whole filtered set with no pagination bar while renderRows is the view", () => {
    renderPlain(
      <DataTable
        columns={columns}
        query={successQuery(rows)}
        getRowId={(row) => row.id}
        empty={{ title: "Không có gì" }}
        defaultView="grid"
        renderRows={(gridRows) => (
          <div data-testid="grid-count">{gridRows.length}</div>
        )}
      />,
    );

    expect(screen.getByTestId("grid-count")).toHaveTextContent("30");
    expect(
      screen.queryByRole("button", { name: "Trang sau" }),
    ).not.toBeInTheDocument();
  });
});

const selectableColumns = columns;

function SelectableSubject() {
  return (
    <DataTable
      columns={selectableColumns}
      query={successQuery(rows.slice(0, 3))}
      getRowId={(row) => row.id}
      empty={{ title: "Không có gì" }}
      renderMobileRow={(row) => <span>Mobile: {row.name}</span>}
      selectionActions={(selected, clearSelection) => (
        <button type="button" onClick={clearSelection}>
          Hành động ({selected.length})
        </button>
      )}
    />
  );
}

function renderSelectable() {
  const router = createMemoryRouter(
    [{ path: "/", element: <SelectableSubject /> }],
    { initialEntries: ["/"] },
  );
  render(<RouterProvider router={router} />);
  return router;
}

describe("DataTable — mobile rows and row selection", () => {
  it("renders a mobile substitute for every row alongside the table", () => {
    renderSelectable();

    const mobileRows = document.querySelectorAll(
      '[data-slot="data-table-mobile-row"]',
    );
    expect(mobileRows).toHaveLength(3);
    expect(screen.getByText("Mobile: Row 1")).toBeInTheDocument();
  });

  it("adds no selection column when selectionActions is not given", () => {
    renderAt("");

    expect(
      screen.queryByRole("checkbox", { name: "Chọn dòng" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("checkbox", { name: "Chọn tất cả" }),
    ).not.toBeInTheDocument();
  });

  it("shows the selection bar only once a row is checked, and clears on demand", async () => {
    const user = userEvent.setup();
    renderSelectable();

    expect(screen.queryByText(/Đã chọn/)).not.toBeInTheDocument();

    const firstRow = screen.getByText("Row 1").closest("tr");
    if (!firstRow) throw new Error("expected the Row 1 <tr>");
    await user.click(
      within(firstRow).getByRole("checkbox", { name: "Chọn dòng" }),
    );

    expect(screen.getByText("Đã chọn 1")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Hành động (1)" }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Bỏ chọn" }));

    expect(screen.queryByText(/Đã chọn/)).not.toBeInTheDocument();
  });
});

const sortableColumns = helper.columns([
  helper.accessor("name", { header: "Tên", filterFn: "includesString" }),
  helper.accessor("status", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Trạng thái" />
    ),
    filterFn: facetFilterFn,
  }),
]);

// r1 (a), r2 (b), r3 (a), r4 (b) — small and fixed, so a stable sort's tie
// order is easy to state.
const sortRows = rows.slice(0, 4);

function SortSubject({
  defaultSort,
}: {
  defaultSort?: { columnId: string; desc?: boolean };
}) {
  return (
    <DataTable
      columns={sortableColumns}
      query={successQuery(sortRows)}
      getRowId={(row) => row.id}
      empty={{ title: "Không có gì" }}
      defaultSort={defaultSort}
    />
  );
}

function renderSort(search: string, defaultSort?: { columnId: string }) {
  const router = createMemoryRouter(
    [{ path: "/", element: <SortSubject defaultSort={defaultSort} /> }],
    { initialEntries: [`/${search}`] },
  );
  render(<RouterProvider router={router} />);
  return router;
}

const sortCellTexts = () =>
  screen
    .getAllByRole("cell")
    .map((cell) => cell.textContent)
    .filter((text) => text?.startsWith("Row "));

describe("DataTable — sort on the URL", () => {
  it("applies `defaultSort` with no `?sort=` in the URL", () => {
    renderSort("", { columnId: "status" });

    // Stable: the "a" rows (r1, r3) keep their relative order ahead of "b".
    expect(sortCellTexts()).toEqual(["Row 1", "Row 3", "Row 2", "Row 4"]);
  });

  it("reads an explicit `?sort=-status` over the default", () => {
    renderSort("?sort=-status", { columnId: "status" });

    expect(sortCellTexts()).toEqual(["Row 2", "Row 4", "Row 1", "Row 3"]);
  });

  it("writes a header click to the URL, and drops the param back to the default", async () => {
    const user = userEvent.setup();
    const router = renderSort("", { columnId: "status" });

    await user.click(screen.getByRole("button", { name: "Trạng thái" }));
    await waitFor(() =>
      expect(router.state.location.search).toContain("sort=-status"),
    );

    // Cycling back to ascending — the list's own default — drops the param.
    await user.click(screen.getByRole("button", { name: "Trạng thái" }));
    await waitFor(() => expect(router.state.location.search).toBe(""));
  });
});
