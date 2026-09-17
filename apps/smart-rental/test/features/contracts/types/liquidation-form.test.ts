import { describe, expect, it } from "vitest";

import {
  liquidationChecklist,
  liquidationFormSchema,
} from "~/features/contracts/types/liquidation-form";

describe("liquidationFormSchema", () => {
  it("passes only once every checklist item is ticked", () => {
    const all = Object.fromEntries(
      liquidationChecklist.map((item) => [item.id, true]),
    );

    expect(liquidationFormSchema.safeParse(all).success).toBe(true);
    expect(
      liquidationFormSchema.safeParse({ ...all, collectKeys: false }).error
        ?.issues[0]?.message,
    ).toBe("Hoàn thành toàn bộ danh sách kiểm tra");
  });
});
