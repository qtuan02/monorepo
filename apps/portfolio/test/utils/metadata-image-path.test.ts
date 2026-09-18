import { describe, expect, it } from "vitest";

import { isMetadataImagePath } from "~/utils/metadata-image-path";

describe("isMetadataImagePath", () => {
  it("matches a generated image under a locale segment", () => {
    expect(isMetadataImagePath("/vi/opengraph-image")).toBe(true);
    expect(isMetadataImagePath("/en/opengraph-image")).toBe(true);
  });

  it("leaves everything else to locale negotiation", () => {
    // Bare: negotiation rewrites it onto the default locale's image.
    expect(isMetadataImagePath("/opengraph-image")).toBe(false);
    // Pages, and a page that merely mentions the word.
    expect(isMetadataImagePath("/")).toBe(false);
    expect(isMetadataImagePath("/en")).toBe(false);
    expect(isMetadataImagePath("/en/opengraph-image/extra")).toBe(false);
    expect(isMetadataImagePath("/en/opengraph-image-notes")).toBe(false);
  });
});
