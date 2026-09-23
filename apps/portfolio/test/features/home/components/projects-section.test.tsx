import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import ProjectsSection from "~/features/home/components/projects-section";
import { PROJECT_ITEMS } from "~/features/home/constants/resume";
import { render } from "../../../support/render";

/**
 * The section's whole job since #269 is one standard block per project, not a
 * shared list (#125 first shrank it to a note plus rows). Two things would
 * silently undo that and neither shows in a snapshot: the blocks collapsing
 * back into one, and a project losing its heading (so the outline stops
 * naming the projects).
 */
describe("ProjectsSection", () => {
  it("gives every project its own block, under a note naming the monorepo", () => {
    const { container } = render(<ProjectsSection />);

    expect(
      screen.getByRole("heading", { level: 2, name: "Dự án cá nhân" }),
    ).toBeInTheDocument();
    expect(
      container.querySelectorAll('[data-slot="standard-block"]'),
    ).toHaveLength(PROJECT_ITEMS.length);
    expect(screen.getByText(/monorepo cá nhân/)).toBeInTheDocument();

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
