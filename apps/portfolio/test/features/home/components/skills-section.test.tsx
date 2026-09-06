import { screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import SkillsSection from "~/features/home/components/skills-section";
import { SKILL_GROUPS } from "~/features/home/constants/resume";
import { render } from "../../../support/render";

/**
 * The section's whole job is that a reader takes in five labelled rows in one
 * pass. Two things can silently undo that and neither shows up in a snapshot:
 * a heading level that skips (so the outline stops naming the groups), and a
 * group rendered without its label.
 */
describe("SkillsSection", () => {
  it("gives every group its own heading under the section's own", () => {
    render(<SkillsSection delay={0} />);

    expect(
      screen.getByRole("heading", { level: 2, name: "Kỹ năng" }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(
      SKILL_GROUPS.length,
    );

    for (const label of [
      "Frontend",
      "Mobile",
      "Backend",
      "DevOps & CI",
      "Công cụ",
    ]) {
      expect(
        screen.getByRole("heading", { level: 3, name: label }),
      ).toBeInTheDocument();
    }
  });

  it("renders each group's skills under that group's heading", () => {
    const { container } = render(<SkillsSection delay={0} />);

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

  it("does not dress a skill chip up as something you can press", () => {
    render(<SkillsSection delay={0} />);

    // A chip that lifts on hover reads as a control. These are labels: there is
    // nothing to activate, and no button or link should exist in the section.
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();

    const chip = screen.getByText("Biome");

    expect(chip.getAttribute("class")).not.toContain("hover:-translate-y");
    expect(chip.getAttribute("class")).not.toContain("select-none");
  });
});
