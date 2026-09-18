import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { DocsSection } from "~/components/page/docs-section";

describe("DocsSection", () => {
  it("numbers the panel `01 / 04` when given its index and total", () => {
    render(
      <DocsSection index={1} total={4} title="Peer dependency">
        <p>nội dung</p>
      </DocsSection>,
    );

    expect(screen.getByText("01 / 04")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 2, name: "Peer dependency" }),
    ).toBeInTheDocument();
  });

  it("pads the index to two digits, so 10 / 12 and 02 / 12 line up", () => {
    render(
      <DocsSection index={10} total={12} title="Mười">
        <p>nội dung</p>
      </DocsSection>,
    );

    expect(screen.getByText("10 / 12")).toBeInTheDocument();
  });

  it("renders no kicker when the section is not numbered", () => {
    const { container } = render(
      <DocsSection title="Import">
        <p>nội dung</p>
      </DocsSection>,
    );

    expect(
      container.querySelector("[data-slot=docs-section-kicker]"),
    ).toBeNull();
  });
});
