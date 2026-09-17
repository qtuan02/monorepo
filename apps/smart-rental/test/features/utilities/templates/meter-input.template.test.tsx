import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import MeterInputTemplate from "~/features/utilities/templates/meter-input.template";

// Phòng 102 is the first row `mockMeterInputRooms` lists (ADR-0012 — one row
// per occupied Phòng; Phòng 101 has no tenant, so it isn't one): last điện
// and last nước are both 1000, kỳ 09's `oldIndex`.
const rowOf = (room: string) =>
  screen.getByRole("row", { name: new RegExp(`^${room}\\b`) });

describe("MeterInputTemplate", () => {
  it("computes consumption as the reading is typed and derives the row's status", async () => {
    const user = userEvent.setup();
    render(<MeterInputTemplate />);

    const row = rowOf("Phòng 102");
    expect(within(row).getByText("Chưa nhập")).toBeInTheDocument();

    await user.type(
      within(row).getByRole("spinbutton", {
        name: "Chỉ số điện mới phòng Phòng 102",
      }),
      "1300",
    );
    expect(within(row).getByText("300")).toBeInTheDocument();
    expect(within(row).getByText("Nháp")).toBeInTheDocument();

    // A reading below last month's is an anomaly, and it wins over the draft.
    await user.type(
      within(row).getByRole("spinbutton", {
        name: "Chỉ số nước mới phòng Phòng 102",
      }),
      "440",
    );
    expect(within(row).getByText("-560")).toBeInTheDocument();
    expect(within(row).getByText("Bất thường")).toBeInTheDocument();

    // The other rows did not move.
    expect(
      within(rowOf("Phòng 103")).getByText("Chưa nhập"),
    ).toBeInTheDocument();
  });

  it("names the field that is not a whole number on submit", async () => {
    const user = userEvent.setup();
    render(<MeterInputTemplate />);

    await user.type(
      within(rowOf("Phòng 102")).getByRole("spinbutton", {
        name: "Chỉ số điện mới phòng Phòng 102",
      }),
      "12.5",
    );
    await user.click(screen.getByRole("button", { name: "Lưu chỉ số" }));

    expect(
      await within(rowOf("Phòng 102")).findByText("Chỉ số phải là số nguyên"),
    ).toBeInTheDocument();
  });
});
