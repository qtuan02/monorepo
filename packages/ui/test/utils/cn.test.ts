import { describe, expect, it } from "vitest";

import { cn } from "../../src/utils/cn";

// `cn` is one line, but it is the line every primitive in this package ends its
// className with — so what is worth asserting is the CONTRACT the primitives
// lean on, not the implementation: conditionals collapse (clsx), and a caller's
// class beats the primitive's own when the two target the same property
// (tailwind-merge). A tailwind-merge major that changed either would break every
// `className` override in the package silently.
describe("cn", () => {
  it("joins class strings and drops falsy ones", () => {
    // Read the flag from a value Biome cannot fold away: the point is the
    // runtime branch every primitive writes, not a literal `false`.
    const isHidden: boolean = [].length > 0;
    expect(cn("flex", isHidden && "hidden", undefined, "gap-2")).toBe(
      "flex gap-2",
    );
  });

  it("accepts the array and object forms clsx supports", () => {
    expect(cn(["flex", { "gap-2": true, hidden: false }])).toBe("flex gap-2");
  });

  it("lets the last class win when two target the same property", () => {
    expect(cn("px-2 py-1", "px-4")).toBe("py-1 px-4");
  });

  it("keeps classes that only look like conflicts", () => {
    expect(cn("px-2", "py-4")).toBe("px-2 py-4");
  });

  it("merges a caller override onto a variant's own classes", () => {
    // The shape every primitive uses: cva output first, caller's className last.
    expect(cn("bg-primary text-primary-foreground", "bg-destructive")).toBe(
      "text-primary-foreground bg-destructive",
    );
  });

  it("returns an empty string when handed nothing", () => {
    expect(cn()).toBe("");
  });
});
