import { screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import SkillsSection from "~/features/home/components/skills-section";
import { SKILL_GROUPS } from "~/features/home/constants/resume";
import { render } from "../../../support/render";

/**
 * The section's whole job is that a reader takes in six labelled rows in one
 * pass. Two things can silently undo that and neither shows up in a snapshot:
 * a heading level that skips (so the outline stops naming the groups), and a
 * group rendered without its label.
 */
describe("SkillsSection", () => {
  it("gives every group its own heading under the section's own", () => {
    render(<SkillsSection />);

    expect(
      screen.getByRole("heading", { level: 2, name: "Skills" }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(
      SKILL_GROUPS.length,
    );

    for (const label of [
      "Programming Languages",
      "Frontend",
      "Mobile",
      "Backend",
      "DevOps & CI",
      "Tooling",
    ]) {
      expect(
        screen.getByRole("heading", { level: 3, name: label }),
      ).toBeInTheDocument();
    }
  });

  it("renders each group's skills under that group's heading", () => {
    const { container } = render(<SkillsSection />);

    for (const group of SKILL_GROUPS) {
      const heading = screen
        .getAllByRole("heading", { level: 3 })
        .find((element) => element.getAttribute("id") === `skills-${group.id}`);

      expect(heading, group.id).toBeDefined();

      // The row is labelled by its heading, so a skill is not merely present
      // on the page — it is present *in the group it belongs to*.
      const row = container.querySelector(
        `[aria-labelledby="skills-${group.id}"]`,
      );

      expect(row, group.id).not.toBeNull();

      for (const skill of group.skills) {
        expect(
          within(row as HTMLElement).getByText(skill),
          `${group.id}: ${skill}`,
        ).toBeInTheDocument();
      }
    }
  });

  it("writes each group label like a directory, with the slash kept out of the accessible name", () => {
    render(<SkillsSection />);

    // `frontend/` is the terminal grammar for a group; the slash is decoration.
    // A screen reader cycling headings should hear "Frontend", not "Frontend
    // slash", and the first test above already asks for the name by itself —
    // this one pins that the slash is nevertheless on screen.
    const heading = screen.getByRole("heading", { level: 3, name: "Frontend" });

    expect(heading).toHaveTextContent(/^Frontend\/$/);
  });

  it("lists the skills in one block, with nothing to press", () => {
    const { container } = render(<SkillsSection />);

    // A skill is a label: a button or a link here would promise a filter that
    // does not exist. And the whole section is one standard block — six rows
    // in one box, not six boxes — which is the count, not the markup, that a
    // rendered page could get wrong.
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(
      container.querySelectorAll('[data-slot="standard-block"]'),
    ).toHaveLength(1);
  });
});
