import { beforeEach, describe, expect, it } from "vitest";

import { useBuildingStore } from "~/stores/use-building-store";

const initialState = useBuildingStore.getState();

// Building scope: the one Toà nhà the whole Portal is filtered by. `null` is a
// real value — "mọi Toà nhà" — not the absence of one, so both directions of
// the switch are pinned, and so is the persistence a reload depends on.
describe("useBuildingStore", () => {
  beforeEach(() => {
    window.localStorage.clear();
    useBuildingStore.setState(initialState, true);
  });

  it("starts on every Toà nhà", () => {
    expect(useBuildingStore.getState().selectedBuildingId).toBeNull();
  });

  it("persists the chosen Toà nhà so a reload keeps it", () => {
    useBuildingStore.getState().setSelectedBuildingId("b2");

    const stored = JSON.parse(window.localStorage.getItem("building") ?? "{}");
    expect(stored.state.selectedBuildingId).toBe("b2");
  });

  it("goes back to every Toà nhà with `null`, and persists that too", () => {
    useBuildingStore.getState().setSelectedBuildingId("b2");
    useBuildingStore.getState().setSelectedBuildingId(null);

    expect(useBuildingStore.getState().selectedBuildingId).toBeNull();
    const stored = JSON.parse(window.localStorage.getItem("building") ?? "{}");
    expect(stored.state.selectedBuildingId).toBeNull();
  });
});
