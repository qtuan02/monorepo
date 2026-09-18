import { screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import ProjectsSection from "~/features/home/components/projects-section";
import { PROJECT_ITEMS } from "~/features/home/constants/resume";
import { render } from "../../../support/render";

/**
 * The section's whole job since #125 is to be *smaller* than the work history:
 * one block, a note saying what these projects are, and a row per project
 * with its links. Three things would silently undo that and none shows in a
 * snapshot: a second block creeping back in, the note going missing, and a
 * row losing its heading (so the outline stops naming the projects).
 */
describe("ProjectsSection", () => {
  it("is one block with a note and one row per project", () => {
    const { container } = render(<ProjectsSection />);

    expect(
      screen.getByRole("heading", { level: 2, name: "Dự án học và demo" }),
    ).toBeInTheDocument();
    expect(
      container.querySelectorAll('[data-slot="standard-block"]'),
    ).toHaveLength(1);
    expect(
      screen.getByText(/không phải sản phẩm production/),
    ).toBeInTheDocument();

    const rows = within(screen.getByRole("list")).getAllByRole("listitem");

    expect(rows).toHaveLength(PROJECT_ITEMS.length);
    expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(
      PROJECT_ITEMS.length,
    );
  });

  it("keeps every repo and demo link, one row each", () => {
    render(<ProjectsSection />);

    const hrefs = screen
      .getAllByRole("link")
      .map((link) => link.getAttribute("href"));
    const expected = PROJECT_ITEMS.flatMap((item) => [
      ...(item.source ?? []).map((source) => source.href),
      ...(item.demo ? [item.demo] : []),
    ]);

    expect(hrefs).toEqual(expected);
  });
});
