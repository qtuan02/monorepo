import { describe, expect, it } from "vitest";

import { trackMockReset } from "~/utils/mock-reset";

describe("trackMockReset", () => {
  it("restores push/splice mutations back to the snapshot it captured", () => {
    const target = [{ id: "1" }, { id: "2" }];
    const reset = trackMockReset(target);

    target.push({ id: "3" });
    target.splice(0, 1);
    expect(target).toEqual([{ id: "2" }, { id: "3" }]);

    reset();

    expect(target).toEqual([{ id: "1" }, { id: "2" }]);
  });

  it("resets in place — the array reference every importer holds stays valid", () => {
    const target = [{ id: "1" }];
    const reset = trackMockReset(target);
    const sameReference = target;

    target.push({ id: "2" });
    reset();

    expect(sameReference).toBe(target);
    expect(sameReference).toEqual([{ id: "1" }]);
  });

  it("never lets a later mutation leak into the captured snapshot", () => {
    const original = { id: "1" };
    const target = [original];
    const reset = trackMockReset(target);

    original.id = "mutated";
    reset();

    expect(target).toEqual([{ id: "1" }]);
  });
});
