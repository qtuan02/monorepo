import { describe, expect, it } from "vitest";

import type { TaskType } from "~/types/task";
import {
  roomStatusConfig,
  taskTypeConfig,
  toFilterOptions,
} from "~/constants/status";

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

  // "maintenance" không còn trong TaskType (ticket #230) — nếu ai đó thêm nó
  // lại, danh sách literal dưới đây lệch với Object.keys và test đỏ.
  it("has an icon and an actionLabel for every TaskType, and no 'maintenance'", () => {
    const types: TaskType[] = [
      "invoice_overdue",
      "contract_expiring",
      "utility_anomaly",
      "residence_notification",
      "residence_registration_expiring",
      "batch_pending",
    ];

    expect(Object.keys(taskTypeConfig).sort()).toEqual([...types].sort());
    for (const config of Object.values(taskTypeConfig)) {
      expect(config.icon).toBeDefined();
      expect(config.actionLabel).not.toBe("");
    }
  });
});
