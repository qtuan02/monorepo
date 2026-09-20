import { describe, expect, it } from "vitest";

import { getDisplayName, getInitials } from "~/utils/display";

describe("getDisplayName", () => {
  it("joins the first and last name", () => {
    expect(
      getDisplayName({ firstName: "Lan", lastName: "Nguyen", username: "lan" }),
    ).toBe("Lan Nguyen");
  });

  it("falls back to the username once both name parts are blank", () => {
    expect(
      getDisplayName({ firstName: "", lastName: "", username: "lan" }),
    ).toBe("lan");
  });

  it("falls back to an empty string, never undefined, once every field is missing", () => {
    expect(getDisplayName({})).toBe("");
    expect(
      getDisplayName({ firstName: null, lastName: null, username: null }),
    ).toBe("");
  });
});

describe("getInitials", () => {
  it("uppercases the first letter of the first and last word", () => {
    expect(getInitials("Lan Nguyen")).toBe("LN");
  });

  it("returns '?' for a blank or whitespace-only name", () => {
    expect(getInitials("")).toBe("?");
    expect(getInitials("   ")).toBe("?");
  });

  it("returns '?' rather than throwing for a missing name", () => {
    expect(getInitials(undefined)).toBe("?");
    expect(getInitials(null)).toBe("?");
  });
});
