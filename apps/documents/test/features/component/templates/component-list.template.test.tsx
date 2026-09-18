import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";

import { componentCatalogue } from "~/constants/docs-catalogue";
import ComponentListTemplate from "~/features/component/templates/component-list.template";

function renderList() {
  return render(
    <MemoryRouter>
      <ComponentListTemplate />
    </MemoryRouter>,
  );
}

describe("the component list", () => {
  it("shows an empty state that names the query, and its clear button brings the list back", async () => {
    const user = userEvent.setup();
    renderList();

    const total = componentCatalogue.items.length;
    expect(screen.getAllByRole("link")).toHaveLength(total);

    await user.type(
      screen.getByRole("searchbox", { name: "Lọc danh sách" }),
      "zz",
    );

    // The filter settles on a debounced value, so the empty state arrives later.
    expect(
      await screen.findByText("Không có kết quả cho “zz”."),
    ).toBeInTheDocument();
    expect(screen.queryAllByRole("link")).toHaveLength(0);
    expect(screen.getByText("0 component")).toBeInTheDocument();

    // Two clear controls now: the input's own `×` and the empty state's button.
    const [, clear] = screen.getAllByRole("button", { name: "Xoá bộ lọc" });
    if (!clear) throw new Error("the empty state has no clear button");
    await user.click(clear);

    expect(await screen.findAllByRole("link")).toHaveLength(total);
    expect(screen.queryByText(/Không có kết quả/)).not.toBeInTheDocument();
  });
});
