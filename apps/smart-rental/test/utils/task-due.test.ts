import { describe, expect, it } from "vitest";

import { ROUTES } from "~/constants/routes";
import { formatDueLabel, taskRelatedPath } from "~/utils/task-due";

const task = {
  id: "task-1",
  type: "maintenance",
  title: "",
  description: "",
  status: "open",
  buildingId: "b1",
  relatedEntity: "room",
  relatedId: "R-B1-103",
  dueDate: "2024-05-25",
  createdAt: "",
} as const;

describe("taskRelatedPath", () => {
  it.each([
    ["invoice", ROUTES.invoiceDetailPath("x-1")],
    ["contract", ROUTES.contractDetailPath("x-1")],
    ["room", ROUTES.roomDetailPath("x-1")],
    ["tenant", `${ROUTES.tenantDetailPath("x-1")}?tab=residence`],
    ["cycle", ROUTES.cycleDetailPath("x-1")],
    ["building", ROUTES.buildingDetailPath("x-1")],
  ] as const)("a %s task links to that entity's detail", (entity, path) => {
    expect(
      taskRelatedPath({ ...task, relatedEntity: entity, relatedId: "x-1" }),
    ).toBe(path);
  });
});

describe("formatDueLabel", () => {
  it("counts the days left, today, and the days overdue", () => {
    expect(formatDueLabel("2024-05-25", new Date("2024-05-20"))).toEqual({
      text: "Còn 5 ngày",
      isOverdue: false,
    });
    expect(formatDueLabel("2024-05-25", new Date("2024-05-25"))).toEqual({
      text: "Hôm nay",
      isOverdue: false,
    });
    expect(formatDueLabel("2024-05-25", new Date("2024-05-28"))).toEqual({
      text: "Quá hạn 3 ngày",
      isOverdue: true,
    });
  });
});
