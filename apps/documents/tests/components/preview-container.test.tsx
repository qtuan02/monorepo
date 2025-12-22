import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { ComponentMetadata } from "~/types/component-metadata";
import PreviewContainer from "~/components/preview-container";

const mockComponent: ComponentMetadata = {
  id: "button",
  name: "Button",
  description: "A button component",
  category: "Form",
  package: "ui",
  filePath: "button.tsx",
  props: [],
  sourceCode: "export function Button() {}",
};

describe("PreviewContainer", () => {
  it("renders preview container", () => {
    render(<PreviewContainer component={mockComponent} />);

    expect(screen.getByTestId("preview-container")).toBeInTheDocument();
  });

  it("displays preview header", () => {
    render(<PreviewContainer component={mockComponent} />);

    expect(screen.getByText("Preview")).toBeInTheDocument();
    expect(screen.getByText("Interactive")).toBeInTheDocument();
  });

  it("shows placeholder for component preview", () => {
    render(<PreviewContainer component={mockComponent} />);

    // Since we're using placeholder until Epic 3, check for placeholder
    expect(screen.getByTestId("preview-placeholder")).toBeInTheDocument();
    expect(screen.getByText("Button")).toBeInTheDocument();
  });

  it("displays component name in placeholder", () => {
    render(<PreviewContainer component={mockComponent} />);

    expect(screen.getByText("Button")).toBeInTheDocument();
    expect(
      screen.getByText("Live preview coming in Epic 3"),
    ).toBeInTheDocument();
  });

  it("has proper styling", () => {
    render(<PreviewContainer component={mockComponent} />);

    const container = screen.getByTestId("preview-container");
    expect(container).toHaveClass("rounded-lg", "border");
  });
});
