import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import type { Building } from "~/types/building";
import BuildingSettingsFormSheet from "~/features/buildings/components/building-settings-form-sheet";

const building: Building = {
  id: "b1",
  name: "Trọ Sinh Viên Xanh",
  address: "123 Ngũ Hành Sơn, Đà Nẵng",
  collectionDay: 5,
  priceList: {
    electricityPricePerKwh: 3000,
    waterPricePerM3: 15000,
    serviceFee: 100000,
  },
};

function renderSheet() {
  const queryClient = new QueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <BuildingSettingsFormSheet
        building={building}
        open
        onOpenChange={() => {}}
      />
    </QueryClientProvider>,
  );
}

describe("BuildingSettingsFormSheet", () => {
  it("shows an Alert once the electricity price is set above the legal cap, and still allows saving", async () => {
    const user = userEvent.setup();
    renderSheet();

    const priceInput = screen.getByLabelText(/Giá điện/);
    await user.clear(priceInput);
    await user.type(priceInput, "4200");

    expect(
      await screen.findByText("Vượt trần giá điện cho người thuê"),
    ).toBeInTheDocument();

    const submit = screen.getByRole("button", { name: "Lưu lại" });
    expect(submit).not.toBeDisabled();
  });

  it("shows no Alert while the price stays under the cap", () => {
    renderSheet();

    expect(
      screen.queryByText("Vượt trần giá điện cho người thuê"),
    ).not.toBeInTheDocument();
  });
});
