import { describe, expect, it } from "vitest";

import { getContractLifecycleSteps } from "~/features/contracts/utils/contract-lifecycle";

describe("getContractLifecycleSteps", () => {
  it("marks the steps before the status done and the status itself active", () => {
    const steps = getContractLifecycleSteps("ending");

    expect(steps.map((step) => step.id)).toEqual([
      "pending",
      "active",
      "ending",
      "ended",
    ]);
    expect(steps.map((step) => step.isCompleted)).toEqual([
      true,
      true,
      false,
      false,
    ]);
    expect(steps.map((step) => step.isActive)).toEqual([
      false,
      false,
      true,
      false,
    ]);
  });

  it("starts at the first step for a pending Hợp đồng", () => {
    const steps = getContractLifecycleSteps("pending");

    expect(steps[0]).toMatchObject({ isActive: true, isCompleted: false });
    expect(steps.some((step) => step.isCompleted)).toBe(false);
  });

  it("ends with every earlier step done for an ended one", () => {
    const steps = getContractLifecycleSteps("ended");

    expect(steps.slice(0, 3).every((step) => step.isCompleted)).toBe(true);
    expect(steps[3]).toMatchObject({ isActive: true });
  });
});
