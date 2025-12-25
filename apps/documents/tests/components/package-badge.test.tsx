import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

import PackageBadge from "~/components/package-badge";

describe("PackageBadge", () => {
  it("renders UI badge for ui package", () => {
    render(<PackageBadge package="ui" />);
    expect(screen.getByText("UI")).toBeInTheDocument();
  });

  it("renders Hook badge for hook package", () => {
    render(<PackageBadge package="hook" />);
    expect(screen.getByText("Hook")).toBeInTheDocument();
  });

  it("has correct test id", () => {
    render(<PackageBadge package="ui" />);
    expect(screen.getByTestId("package-badge")).toBeInTheDocument();
  });
});

