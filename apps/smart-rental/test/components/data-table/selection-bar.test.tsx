import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { SelectionBar } from "~/components/data-table/selection-bar";

describe("SelectionBar", () => {
  it("renders nothing while nothing is selected", () => {
    const { container } = render(
      <SelectionBar selectedCount={0} onClear={vi.fn()} />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it("shows the count and the given actions once rows are selected", () => {
    render(
      <SelectionBar
        selectedCount={2}
        onClear={vi.fn()}
        actions={<button type="button">Gửi nhắc</button>}
      />,
    );

    expect(screen.getByText("Đã chọn 2")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Gửi nhắc" }),
    ).toBeInTheDocument();
  });

  it("clears the selection from the ✕ button", async () => {
    const user = userEvent.setup();
    const onClear = vi.fn();
    render(<SelectionBar selectedCount={3} onClear={onClear} />);

    await user.click(screen.getByRole("button", { name: "Bỏ chọn" }));

    expect(onClear).toHaveBeenCalledOnce();
  });
});
