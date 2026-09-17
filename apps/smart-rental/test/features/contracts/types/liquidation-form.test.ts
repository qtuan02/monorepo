import { describe, expect, it } from "vitest";

import { liquidationFormSchema } from "~/features/contracts/types/liquidation-form";

describe("liquidationFormSchema", () => {
  it("passes FORFEITED and RETURNED with no reason or amount", () => {
    expect(
      liquidationFormSchema.safeParse({ decision: "FORFEITED", reason: "" })
        .success,
    ).toBe(true);
    expect(
      liquidationFormSchema.safeParse({ decision: "RETURNED", reason: "" })
        .success,
    ).toBe(true);
  });

  it("requires a reason and a return amount for PARTIAL_RETURNED", () => {
    const result = liquidationFormSchema.safeParse({
      decision: "PARTIAL_RETURNED",
      reason: "",
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues.map((issue) => issue.path[0])).toEqual(
      expect.arrayContaining(["reason", "returnAmount"]),
    );
  });

  it("parses a valid PARTIAL_RETURNED submission", () => {
    const result = liquidationFormSchema.safeParse({
      decision: "PARTIAL_RETURNED",
      returnAmount: "6500000",
      reason: "Hư hỏng nội thất",
    });

    expect(result.success).toBe(true);
    expect(result.data).toMatchObject({
      decision: "PARTIAL_RETURNED",
      returnAmount: 6500000,
      reason: "Hư hỏng nội thất",
    });
  });
});
