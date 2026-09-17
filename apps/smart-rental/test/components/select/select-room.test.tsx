import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { SelectRoom } from "~/components/select/select-room";

function renderSelectRoom(onlyAvailable: boolean) {
  render(
    <QueryClientProvider client={new QueryClient()}>
      <SelectRoom
        buildingId="b1"
        onlyAvailable={onlyAvailable}
        onValueChange={vi.fn()}
      />
    </QueryClientProvider>,
  );
}

// b1 (Trọ Sinh Viên Xanh) has 6 Phòng, exactly one "available" (Phòng 101) —
// the wizard's own step 1 (spec #153 §10 row 15, AC #162): "chỉ liệt Phòng
// trống của Toà nhà đang chọn".
describe("SelectRoom", () => {
  it("with onlyAvailable, lists only the vacant Phòng of the Building scope", async () => {
    const user = userEvent.setup();
    renderSelectRoom(true);

    await user.click(screen.getByRole("combobox"));

    expect(
      await screen.findByRole("option", { name: /Phòng 101/ }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("option", { name: /Phòng 102/ }),
    ).not.toBeInTheDocument();
  });

  it("without onlyAvailable, lists every Phòng of the Building scope", async () => {
    const user = userEvent.setup();
    renderSelectRoom(false);

    await user.click(screen.getByRole("combobox"));

    expect(
      await screen.findByRole("option", { name: /Phòng 101/ }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("option", { name: /Phòng 102/ }),
    ).toBeInTheDocument();
  });
});
