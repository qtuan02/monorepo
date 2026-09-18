import { describe, expect, it } from "vitest";

import { oldIndexCorrectionFormSchema } from "~/features/cycles/types/old-index-correction-form";

describe("oldIndexCorrectionFormSchema", () => {
  it("requires a ghi chú — thay công tơ must always say why (ADR-0013)", () => {
    const result = oldIndexCorrectionFormSchema.safeParse({
      oldIndex: "1050",
      note: "",
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues.map((issue) => issue.path[0])).toEqual([
      "note",
    ]);
  });

  it("requires a whole non-negative chỉ số cũ", () => {
    expect(
      oldIndexCorrectionFormSchema.safeParse({
        oldIndex: "-1",
        note: "Thay công tơ",
      }).success,
    ).toBe(false);
    expect(
      oldIndexCorrectionFormSchema.safeParse({
        oldIndex: "1.5",
        note: "Thay công tơ",
      }).success,
    ).toBe(false);
  });

  it("passes a valid correction", () => {
    expect(
      oldIndexCorrectionFormSchema.safeParse({
        oldIndex: "1050",
        note: "Thay công tơ điện ngày 18/09",
      }).success,
    ).toBe(true);
  });
});
