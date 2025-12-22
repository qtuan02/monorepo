import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router";
import { describe, expect, it } from "vitest";

import type { ComponentMetadata } from "~/types/component-metadata";
import ComponentDetail from "~/components/component-detail";

const mockComponent: ComponentMetadata = {
  id: "button",
  name: "Button",
  description: "A reusable button component for user interactions",
  category: "Form",
  package: "ui",
  filePath: "packages/ui/src/components/button.tsx",
  props: [
    {
      name: "variant",
      type: '"primary" | "secondary"',
      required: true,
      description: "Button style variant",
      defaultValue: "primary",
    },
    {
      name: "disabled",
      type: "boolean",
      required: false,
      description: "Disable the button",
    },
  ],
  sourceCode: `import React from "react";

export interface ButtonProps {
  variant?: "primary" | "secondary";
  disabled?: boolean;
  children: React.ReactNode;
}

export function Button({ variant = "primary", disabled, children }: ButtonProps) {
  return (
    <button className={variant} disabled={disabled}>
      {children}
    </button>
  );
}`,
  examples: [
    `<Button variant="primary">Click me</Button>`,
    `<Button variant="secondary" disabled>Disabled</Button>`,
  ],
};

const mockComponentNoExamples: ComponentMetadata = {
  ...mockComponent,
  examples: undefined,
};

describe("ComponentDetail", () => {
  it("renders component detail", () => {
    render(
      <BrowserRouter>
        <ComponentDetail component={mockComponent} categorySlug="form" />
      </BrowserRouter>,
    );

    expect(screen.getByTestId("component-detail")).toBeInTheDocument();
  });

  it("displays component name and description", () => {
    render(
      <BrowserRouter>
        <ComponentDetail component={mockComponent} categorySlug="form" />
      </BrowserRouter>,
    );

    expect(screen.getByText("Button")).toBeInTheDocument();
    expect(
      screen.getByText("A reusable button component for user interactions"),
    ).toBeInTheDocument();
  });

  it("shows category badge", () => {
    render(
      <BrowserRouter>
        <ComponentDetail component={mockComponent} categorySlug="form" />
      </BrowserRouter>,
    );

    expect(screen.getByText("Form")).toBeInTheDocument();
  });

  it("shows package badge", () => {
    render(
      <BrowserRouter>
        <ComponentDetail component={mockComponent} categorySlug="form" />
      </BrowserRouter>,
    );

    expect(screen.getByText("UI")).toBeInTheDocument();
  });

  it("has back link to category page", () => {
    render(
      <BrowserRouter>
        <ComponentDetail component={mockComponent} categorySlug="form" />
      </BrowserRouter>,
    );

    const backLink = screen.getByText(/← Back to Form/);
    expect(backLink).toHaveAttribute("href", "/components/form");
  });

  it("renders preview section", () => {
    render(
      <BrowserRouter>
        <ComponentDetail component={mockComponent} categorySlug="form" />
      </BrowserRouter>,
    );

    expect(screen.getByText("Preview")).toBeInTheDocument();
    expect(screen.getByTestId("preview-container")).toBeInTheDocument();
  });

  it("renders props table section", () => {
    render(
      <BrowserRouter>
        <ComponentDetail component={mockComponent} categorySlug="form" />
      </BrowserRouter>,
    );

    expect(screen.getByText("Props")).toBeInTheDocument();
    expect(screen.getByTestId("props-table")).toBeInTheDocument();
  });

  it("renders source code section", () => {
    render(
      <BrowserRouter>
        <ComponentDetail component={mockComponent} categorySlug="form" />
      </BrowserRouter>,
    );

    expect(screen.getByText("Source Code")).toBeInTheDocument();
    expect(screen.getByTestId("code-viewer")).toBeInTheDocument();
  });

  it("renders examples section when examples exist", () => {
    render(
      <BrowserRouter>
        <ComponentDetail component={mockComponent} categorySlug="form" />
      </BrowserRouter>,
    );

    expect(screen.getByText("Examples")).toBeInTheDocument();
  });

  it("does not render examples section when no examples", () => {
    render(
      <BrowserRouter>
        <ComponentDetail
          component={mockComponentNoExamples}
          categorySlug="form"
        />
      </BrowserRouter>,
    );

    expect(screen.queryByText("Examples")).not.toBeInTheDocument();
  });

  it("uses semantic HTML sections", () => {
    render(
      <BrowserRouter>
        <ComponentDetail component={mockComponent} categorySlug="form" />
      </BrowserRouter>,
    );

    // Check for aria-labelledby attributes
    expect(screen.getByLabelText("Preview")).toBeInTheDocument();
    expect(screen.getByLabelText("Props")).toBeInTheDocument();
    expect(screen.getByLabelText("Source Code")).toBeInTheDocument();
    expect(screen.getByLabelText("Examples")).toBeInTheDocument();
  });
});
