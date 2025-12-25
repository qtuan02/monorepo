import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { ComponentMetadata } from "~/types/component-metadata";
import PreviewContainer from "~/components/preview-container";

const mockComponent: ComponentMetadata = {
  id: "button",
  name: "Button",
  description: "A button component",
  category: "ui",
  parentCategory: "shadcn",
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

  it("renders demo component when available", () => {
    render(<PreviewContainer component={mockComponent} />);

    // Button demo component renders directly when demo exists
    // Check for demo component content (variants, sizes sections)
    expect(screen.getByText("Variants")).toBeInTheDocument();
    // Multiple Default buttons exist - use getAllByText
    expect(screen.getAllByText("Default").length).toBeGreaterThan(0);
  });

  it("has proper styling", () => {
    render(<PreviewContainer component={mockComponent} />);

    const container = screen.getByTestId("preview-container");
    expect(container).toHaveClass("rounded-lg", "border");
  });
});
