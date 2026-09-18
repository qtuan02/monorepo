import { describe, expect, it } from "vitest";

import { roomStatusConfig, toFilterOptions } from "~/constants/status";

describe("status config", () => {
  it("has a label and an icon for every Phòng status", () => {
    const statuses = ["available", "occupied", "maintenance", "reserved"];

    expect(Object.keys(roomStatusConfig).sort()).toEqual(statuses.sort());
    for (const config of Object.values(roomStatusConfig)) {
      expect(config.label).not.toBe("");
      expect(config.icon).toBeDefined();
    }
  });

  it("derives faceted-filter options from a config, in its own order", () => {
    expect(toFilterOptions(roomStatusConfig).map((o) => o.value)).toEqual([
      "available",
      "occupied",
      "maintenance",
      "reserved",
    ]);
    expect(toFilterOptions(roomStatusConfig)[0]).toMatchObject({
      label: "Trống",
      value: "available",
    });
  });
});
