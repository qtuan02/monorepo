import { create } from "zustand";
import { persist } from "zustand/middleware";

interface BuildingStore {
  /** Building scope — `null` is "mọi Toà nhà", a real choice rather than none. */
  selectedBuildingId: string | null;
  setSelectedBuildingId: (id: string | null) => void;
}

/**
 * App-wide client state: the header's selector writes it and every list
 * filters by it (spec #127). Read through a narrow selector,
 * `useBuildingStore((s) => s.selectedBuildingId)`.
 *
 * Plain `persist` on localStorage — the prototype's encrypted storage is gone
 * with `crypto-js`: its key sat in the bundle, so it only ever obfuscated.
 */
export const useBuildingStore = create<BuildingStore>()(
  persist(
    (set) => ({
      selectedBuildingId: null,
      setSelectedBuildingId: (selectedBuildingId) =>
        set({ selectedBuildingId }),
    }),
    { name: "building" },
  ),
);
