import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import HeroSection from "~/features/home/components/hero-section";
import { render } from "../../../support/render";

/**
 * The hero is the whole of what a five-second reader and an unfurl preview
 * see. What is worth pinning here is not the copy but the shape of the four
 * quick actions: which of them leave the page, and which hand off to another
 * application instead — getting that wrong opens a blank tab that is left
 * behind, or worse, breaks the tap entirely on iOS Safari.
 */
describe("HeroSection", () => {
  it("says what the candidate does, above the fold", () => {
    render(<HeroSection />);

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Xin chào, mình là Tuấn",
    );
    expect(
      screen.getByText(/Frontend-led full-stack engineer/),
    ).toBeInTheDocument();
    expect(screen.getByText(/MedViet/)).toBeInTheDocument();
  });

  it("opens a page in a new tab but hands a mailto off to the mail client", () => {
    render(<HeroSection />);

    const email = screen.getByRole("link", { name: "Email" });
    const github = screen.getByRole("link", { name: "GitHub" });
    const linkedin = screen.getByRole("link", { name: "LinkedIn" });

    expect(email).toHaveAttribute("href", expect.stringMatching(/^mailto:/));
    expect(email).not.toHaveAttribute("target");

    for (const link of [github, linkedin]) {
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noreferrer");
    }
  });

  it("renders the print action as the fourth quick action", () => {
    render(<HeroSection />);

    expect(screen.getByRole("button", { name: "In CV" })).toBeInTheDocument();
  });

  it("hides the waving hand from assistive technology", () => {
    render(<HeroSection />);

    // Decorative text, not an icon: a screen reader announcing "waving hand"
    // after the name adds nothing and interrupts the one line that matters.
    expect(screen.getByText("👋")).toHaveAttribute("aria-hidden", "true");
  });
});
