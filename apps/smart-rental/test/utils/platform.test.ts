import { describe, expect, it } from "vitest";

import { isMacPlatform } from "~/utils/platform";

describe("isMacPlatform", () => {
  it("reads a Mac platform string as Mac", () => {
    expect(isMacPlatform("MacIntel")).toBe(true);
  });

  it("reads Windows and Linux platform strings as not Mac", () => {
    expect(isMacPlatform("Win32")).toBe(false);
    expect(isMacPlatform("Linux x86_64")).toBe(false);
  });

  it("defaults to the live navigator, which jsdom reports as non-Mac", () => {
    expect(isMacPlatform()).toBe(false);
  });
});
