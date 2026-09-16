import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import SectionHeading from "~/features/home/components/section-heading";
import { render } from "../../../support/render";

/**
 * Every section after the hero titles itself through this one component, so
 * the heading level is decided here for all seven at once. The template test
 * pins the outline end to end; this pins the one decision the outline rests on,
 * so a section that stops using the component is caught even before the
 * template notices.
 */
describe("SectionHeading", () => {
  it("renders an h2 — one level under the hero's h1, for all seven sections", () => {
    render(<SectionHeading>Kinh nghiệm</SectionHeading>);

    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
      "Kinh nghiệm",
    );
  });

  it("keeps the `##` mark out of the heading's accessible name", () => {
    // The mark is the redesign's visual signature for a section title — a
    // markdown heading, in indigo — and nothing more. Left in the name, a
    // screen reader would read "number number Kinh nghiệm" seven times over,
    // and every `getByRole("heading", { name })` in the E2E specs would have
    // to spell it.
    render(<SectionHeading>Kinh nghiệm</SectionHeading>);

    expect(
      screen.getByRole("heading", { level: 2, name: "Kinh nghiệm" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
      /^##\s*Kinh nghiệm$/,
    );
  });
});
