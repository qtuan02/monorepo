import { describe, expect, it } from "vitest";

import { getInitials } from "~/utils/string";

describe("getInitials", () => {
  it("takes the first and last name's initials", () => {
    expect(getInitials("Nguyễn Văn An")).toBe("NA");
  });

  it("falls back to the first two letters of a single word", () => {
    expect(getInitials("admin")).toBe("AD");
  });

  it("ignores stray whitespace", () => {
    expect(getInitials("  Trần   Thị  ")).toBe("TT");
  });
});
