import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import SearchDialog from "~/features/layout/components/header/search-dialog";

describe("SearchDialog", () => {
  it("opens on Ctrl+K with the quick links, then switches to results on a query", async () => {
    const user = userEvent.setup();
    render(<SearchDialog />);

    await user.keyboard("{Control>}k{/Control}");
    expect(await screen.findByText("Truy cập nhanh")).toBeInTheDocument();

    await user.keyboard("hợp đồng");
    expect(screen.queryByText("Truy cập nhanh")).not.toBeInTheDocument();
    expect(screen.getByText("Hợp đồng #HĐ-2024-089")).toBeInTheDocument();
    expect(screen.queryByText("Toà nhà Sunrise")).not.toBeInTheDocument();
  });

  it("says so when nothing matches", async () => {
    const user = userEvent.setup();
    render(<SearchDialog />);

    await user.click(screen.getByRole("button", { name: "Tìm kiếm" }));
    await user.keyboard("zzzz");

    expect(
      await screen.findByText("Không tìm thấy kết quả"),
    ).toBeInTheDocument();
  });
});
