import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import MeterInputTemplate from "~/features/utilities/templates/meter-input.template";

// Phòng 101 is the first Mock row: last điện 1250, last nước 450.
const rowOf = (room: string) =>
  screen.getByRole("row", { name: new RegExp(`^${room}\\b`) });

describe("MeterInputTemplate", () => {
  it("computes consumption as the reading is typed and derives the row's status", async () => {
    const user = userEvent.setup();
    render(<MeterInputTemplate />);

    const row = rowOf("101");
    expect(within(row).getByText("Chưa nhập")).toBeInTheDocument();

    await user.type(
      within(row).getByRole("spinbutton", {
        name: "Chỉ số điện mới phòng 101",
      }),
      "1300",
    );
    expect(within(row).getByText("50")).toBeInTheDocument();
    expect(within(row).getByText("Nháp")).toBeInTheDocument();

    // A reading below last month's is an anomaly, and it wins over the draft.
    await user.type(
      within(row).getByRole("spinbutton", {
        name: "Chỉ số nước mới phòng 101",
      }),
      "440",
    );
    expect(within(row).getByText("-10")).toBeInTheDocument();
    expect(within(row).getByText("Bất thường")).toBeInTheDocument();

    // The other rows did not move.
    expect(within(rowOf("102")).getByText("Chưa nhập")).toBeInTheDocument();
  });
});
