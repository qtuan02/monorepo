import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Building } from "~/types/building";
import BuildingScope, {
  BUILDING_SCOPE_TABS_MAX,
} from "~/features/layout/components/header/building-scope";
import { useGetBuildings } from "~/hooks/api/building";
import { useBuildingStore } from "~/stores/use-building-store";

vi.mock("~/hooks/api/building", () => ({ useGetBuildings: vi.fn() }));

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

const threeBuildings = [
  building("b1", "Trọ Sinh Viên Xanh"),
  building("b2", "Căn hộ Dịch Vụ Cao Cấp"),
];
const sevenBuildings = Array.from(
  { length: BUILDING_SCOPE_TABS_MAX + 1 },
  (_, i) => building(`b${i + 1}`, `Toà nhà ${i + 1}`),
);

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

  it("renders a tabs row for six Toà nhà or fewer (spec #153 §10 row 21)", () => {
    vi.mocked(useGetBuildings).mockReturnValue({
      data: threeBuildings,
    } as ReturnType<typeof useGetBuildings>);
    renderScope();

    expect(
      screen.getByRole("button", { name: "Trọ Sinh Viên Xanh" }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
  });

  it("switches to a Select once there are more than six Toà nhà", () => {
    vi.mocked(useGetBuildings).mockReturnValue({
      data: sevenBuildings,
    } as ReturnType<typeof useGetBuildings>);
    renderScope();

    expect(
      screen.getByRole("combobox", { name: "Toà nhà" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Toà nhà 1" }),
    ).not.toBeInTheDocument();
  });

  it("writes the choice to the app-wide store, `null` for «Tất cả»", async () => {
    const user = userEvent.setup();
    vi.mocked(useGetBuildings).mockReturnValue({
      data: threeBuildings,
    } as ReturnType<typeof useGetBuildings>);
    renderScope();

    await user.click(
      screen.getByRole("button", { name: "Trọ Sinh Viên Xanh" }),
    );
    expect(useBuildingStore.getState().selectedBuildingId).toBe("b1");

    await user.click(screen.getByRole("button", { name: "Tất cả Toà nhà" }));
    expect(useBuildingStore.getState().selectedBuildingId).toBeNull();
  });
});
