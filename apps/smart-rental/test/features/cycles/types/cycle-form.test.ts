import { describe, expect, it } from "vitest";

import { buildCycleFormSchema } from "~/features/cycles/types/cycle-form";

const rows = [
  { oldElectricity: 1000, oldWater: 800 },
  { oldElectricity: 500, oldWater: 200 },
];

describe("buildCycleFormSchema", () => {
  it("chặn hẳn a chỉ số mới lower than chỉ số cũ, inline on that field", () => {
    const schema = buildCycleFormSchema(rows);
    const result = schema.safeParse({
      rows: [
        { roomId: "R1", newElectricity: "900", newWater: "" },
        { roomId: "R2", newElectricity: "", newWater: "" },
      ],
    });

    expect(result.success).toBe(false);
    expect(
      result.error?.issues.some(
        (issue) =>
          issue.message === "Chỉ số mới phải ≥ chỉ số cũ (1000)" &&
          issue.path.join(".") === "rows.0.newElectricity",
      ),
    ).toBe(true);
  });

  it("passes a chỉ số mới equal to chỉ số cũ — 0 tiêu thụ is not a decrease", () => {
    const schema = buildCycleFormSchema(rows);
    const result = schema.safeParse({
      rows: [
        { roomId: "R1", newElectricity: "1000", newWater: "800" },
        { roomId: "R2", newElectricity: "", newWater: "" },
      ],
    });

    expect(result.success).toBe(true);
  });

  it("leaves an empty field alone — not every Phòng is read yet", () => {
    const schema = buildCycleFormSchema(rows);
    const result = schema.safeParse({
      rows: [
        { roomId: "R1", newElectricity: "", newWater: "" },
        { roomId: "R2", newElectricity: "", newWater: "" },
      ],
    });

    expect(result.success).toBe(true);
  });

  it("chặn a chỉ số nước mới lower than chỉ số cũ independently of điện", () => {
    const schema = buildCycleFormSchema(rows);
    const result = schema.safeParse({
      rows: [
        { roomId: "R1", newElectricity: "1100", newWater: "700" },
        { roomId: "R2", newElectricity: "", newWater: "" },
      ],
    });

    expect(result.success).toBe(false);
    expect(
      result.error?.issues.some(
        (issue) => issue.path.join(".") === "rows.0.newWater",
      ),
    ).toBe(true);
  });
});
