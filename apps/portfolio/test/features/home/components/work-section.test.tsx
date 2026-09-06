import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import WorkSection from "~/features/home/components/work-section";
import { WORK_ITEMS } from "~/features/home/constants/resume";
import { render } from "../../../support/render";

/**
 * Progressive disclosure: the section opens with the current role expanded and
 * every earlier one folded away, so the first screen reads as a summary rather
 * than as three walls of bullets. Which rows start open is a decision the
 * section makes — the row itself only obeys `defaultExpanded` — so this is the
 * only place it can be asserted.
 */
describe("WorkSection", () => {
  it("opens the first row and leaves the rest folded", () => {
    render(<WorkSection delay={0} />);

    const toggles = screen.getAllByRole("button", {
      name: "Xem chi tiết công việc",
    });

    expect(toggles).toHaveLength(WORK_ITEMS.length);
    expect(toggles[0]).toHaveAttribute("aria-expanded", "true");

    for (const toggle of toggles.slice(1)) {
      expect(toggle).toHaveAttribute("aria-expanded", "false");
    }
  });

  it("still renders a folded row's bullets into the markup", () => {
    render(<WorkSection delay={0} />);

    // The body is markup either way — the accordion only animates its height —
    // which is what keeps a crawler reading a role nobody clicked open. This
    // line is from the last row, the one furthest from expanded.
    expect(screen.getByText(/Highlands Coffee/)).toBeInTheDocument();
  });

  it("badges the one role that carries an award", () => {
    render(<WorkSection delay={0} />);

    expect(screen.getByText("VDA 2025")).toBeInTheDocument();
  });
});
