import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import type { Building } from "~/types/building";
import { mockBuildings } from "~/constants/mock/buildings";
import BuildingScope, {
  BUILDING_SCOPE_TABS_MAX,
} from "~/features/layout/components/header/building-scope";
import { useBuildingStore } from "~/stores/use-building-store";
import { trackMockReset } from "~/utils/mock-reset";

// The real Mock, not a hook double — this app's tests render on the same
// array `~/hooks/api/building` reads (README § Test: "không mock gì ngoài
// store token vì dữ liệu là Mock hằng số nên render thật").
const firstBuilding = mockBuildings[0];
if (!firstBuilding) throw new Error("mockBuildings has no first entry.");

function building(id: string, name: string): Building {
  return {
    id,
    name,
    address: "",
    collectionDay: 5,
    priceList: {
      electricityPricePerKwh: 3500,
      waterPricePerM3: 25000,
      serviceFee: 0,
    },
  };
}

const initialBuildingState = useBuildingStore.getState();

function renderScope() {
  render(
    <QueryClientProvider client={new QueryClient()}>
      <BuildingScope />
    </QueryClientProvider>,
  );
}

describe("BuildingScope", () => {
  beforeEach(() => {
    useBuildingStore.setState(initialBuildingState, true);
  });

  it("renders a tabs row for six Toà nhà or fewer (spec #153 §10 row 21)", async () => {
    renderScope();

    expect(
      await screen.findByRole("button", { name: firstBuilding.name }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
  });

  describe("with more than six Toà nhà", () => {
    const reset = trackMockReset(mockBuildings);

    beforeEach(() => {
      for (let i = mockBuildings.length; i <= BUILDING_SCOPE_TABS_MAX; i += 1) {
        mockBuildings.push(building(`b-extra-${i}`, `Toà nhà thêm ${i}`));
      }
    });

    afterEach(reset);

    it("switches to a Select once there are more than six Toà nhà", async () => {
      renderScope();

      expect(
        await screen.findByRole("combobox", { name: "Toà nhà" }),
      ).toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: firstBuilding.name }),
      ).not.toBeInTheDocument();
    });
  });

  it("writes the choice to the app-wide store, `null` for «Tất cả»", async () => {
    const user = userEvent.setup();
    renderScope();

    await user.click(
      await screen.findByRole("button", { name: firstBuilding.name }),
    );
    expect(useBuildingStore.getState().selectedBuildingId).toBe(
      firstBuilding.id,
    );

    await user.click(screen.getByRole("button", { name: "Tất cả Toà nhà" }));
    expect(useBuildingStore.getState().selectedBuildingId).toBeNull();
  });
});
