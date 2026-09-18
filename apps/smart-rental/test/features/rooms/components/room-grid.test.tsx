import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";

import type { Room } from "~/types/room";
import RoomGrid from "~/features/rooms/components/room-grid";

const roomA: Room = {
  id: "R-B2-201",
  buildingId: "b2",
  name: "201",
  floor: 2,
  area: 20,
  price: 3_000_000,
  status: "available",
  type: "single",
  tenant: null,
  lastUpdated: "18/09/2026",
};

const roomB: Room = {
  id: "R-B1-101",
  buildingId: "b1",
  name: "101",
  floor: 1,
  area: 25,
  price: 2_700_000,
  status: "occupied",
  type: "double",
  tenant: "Nguyễn Văn A",
  lastUpdated: "18/09/2026",
};

function renderGrid(buildingNameById?: Map<string, string>) {
  return render(
    <MemoryRouter>
      <RoomGrid rooms={[roomA, roomB]} buildingNameById={buildingNameById} />
    </MemoryRouter>,
  );
}

describe("RoomGrid", () => {
  it("groups Toà nhà before tầng, each Toà nhà with one heading, when buildingNameById is given (scope null)", () => {
    renderGrid(
      new Map([
        ["b1", "Trọ Sinh Viên Xanh"],
        ["b2", "Chung cư Mini Lê Duẩn"],
      ]),
    );

    // level 2 only — a room's own name is an h3 inside its card, not part of
    // this grouping hierarchy.
    const headings = screen
      .getAllByRole("heading", { level: 2 })
      .map((h) => h.textContent);
    // Toà nhà sorted by name: "Chung cư..." (b2) before "Trọ Sinh Viên..." (b1).
    expect(headings).toEqual([
      "Chung cư Mini Lê Duẩn",
      "Tầng 2",
      "Trọ Sinh Viên Xanh",
      "Tầng 1",
    ]);
  });

  it("groups by tầng only, no Toà nhà heading, when buildingNameById is absent (a single scope)", () => {
    renderGrid();

    const headings = screen
      .getAllByRole("heading", { level: 2 })
      .map((h) => h.textContent);
    expect(headings).toEqual(["Tầng 2", "Tầng 1"]);
    expect(screen.queryByText("Trọ Sinh Viên Xanh")).not.toBeInTheDocument();
  });
});
