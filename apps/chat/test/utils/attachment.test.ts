import { describe, expect, it } from "vitest";

import { getFileExtensionFromUrl } from "~/utils/attachment";

describe("getFileExtensionFromUrl", () => {
  it("reads the extension off the URL's last path segment", () => {
    expect(
      getFileExtensionFromUrl("http://localhost:8089/api/files/abc.png"),
    ).toBe("png");
  });

  it("ignores a query string or fragment after the extension", () => {
    expect(
      getFileExtensionFromUrl(
        "http://localhost:8089/api/files/report.pdf?token=abc",
      ),
    ).toBe("pdf");
  });

  it("returns an empty string when the last segment has no extension", () => {
    expect(getFileExtensionFromUrl("http://localhost:8089/api/files/abc")).toBe(
      "",
    );
  });
});
