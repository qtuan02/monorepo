import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router";

import ComponentCard from "~/components/component-card";
import type { ComponentMetadata } from "~/types/component-metadata";

const mockComponent: ComponentMetadata = {
  id: "button",
  name: "Button",
  description: "A button component for user interactions",
  category: "Form",
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
    expect(link).toHaveAttribute("href", "/components/form/button");
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

