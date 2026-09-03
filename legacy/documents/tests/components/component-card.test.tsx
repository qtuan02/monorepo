import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router";
import { describe, expect, it } from "vitest";

import type { ComponentMetadata } from "~/types/component-metadata";
import ComponentCard from "~/components/component-card";

const mockComponent: ComponentMetadata = {
  id: "button",
  name: "Button",
  description: "A button component for user interactions",
  category: "ui",
  parentCategory: "shadcn",
  package: "ui",
  filePath: "button.tsx",
  props: [],
  sourceCode: "",
};

describe("ComponentCard", () => {
  it("renders component name and description", () => {
    render(
      <BrowserRouter>
        <ComponentCard component={mockComponent} />
      </BrowserRouter>,
    );

    expect(screen.getByText("Button")).toBeInTheDocument();
    expect(
      screen.getByText("A button component for user interactions"),
    ).toBeInTheDocument();
  });

  it("has correct test id", () => {
    render(
      <BrowserRouter>
        <ComponentCard component={mockComponent} />
      </BrowserRouter>,
    );

    expect(screen.getByTestId("component-card")).toBeInTheDocument();
  });

  it("links to component detail page", () => {
    render(
      <BrowserRouter>
        <ComponentCard component={mockComponent} />
      </BrowserRouter>,
    );

    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/components/button");
  });

  it("renders placeholder thumbnail", () => {
    render(
      <BrowserRouter>
        <ComponentCard component={mockComponent} />
      </BrowserRouter>,
    );

    expect(screen.getByText("Preview")).toBeInTheDocument();
  });

  it("displays package badge", () => {
    render(
      <BrowserRouter>
        <ComponentCard component={mockComponent} />
      </BrowserRouter>,
    );

    expect(screen.getByText("UI")).toBeInTheDocument();
  });
});
