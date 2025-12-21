import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

import EmptyState from "~/components/empty-state";

describe("EmptyState", () => {
  it("renders empty state message", () => {
    render(<EmptyState category="Form" />);

    expect(screen.getByText("No components found")).toBeInTheDocument();
    expect(
      screen.getByText(/The Form category doesn't have any components yet/),
    ).toBeInTheDocument();
  });

  it("has correct test id", () => {
    render(<EmptyState category="Form" />);

    expect(screen.getByTestId("empty-state")).toBeInTheDocument();
  });

  it("displays icon", () => {
    render(<EmptyState category="Layout" />);

    // Check for the Package icon (lucide-react renders as SVG with aria-hidden)
    const icon = document.querySelector("svg.lucide-package");
    expect(icon).toBeInTheDocument();
  });
});

