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
  parentCategory: "shadcn",
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
  previews: [
    `<Button variant="primary">Click me</Button>`,
    `<Button variant="secondary" disabled>Disabled</Button>`,
  ],
};

const mockComponentNoExamples: ComponentMetadata = {
  ...mockComponent,
  previews: undefined,
};

describe("ComponentDetail", () => {
  it("renders component detail", () => {
    render(
      <BrowserRouter>
        <ComponentDetail component={mockComponent} />
      </BrowserRouter>,
    );

    expect(screen.getByTestId("component-detail")).toBeInTheDocument();
  });

  it("displays component name and description", () => {
    render(
      <BrowserRouter>
        <ComponentDetail component={mockComponent} />
      </BrowserRouter>,
    );

    expect(screen.getByText("Button")).toBeInTheDocument();
    expect(
      screen.getByText("A reusable button component for user interactions"),
    ).toBeInTheDocument();
  });

  it("does not show category badge (removed per AC4)", () => {
    render(
      <BrowserRouter>
        <ComponentDetail component={mockComponent} />
      </BrowserRouter>,
    );

    // Category badge should no longer appear - only package badge remains
    expect(screen.queryByText("Form")).not.toBeInTheDocument();
  });

  it("shows package badge", () => {
    render(
      <BrowserRouter>
        <ComponentDetail component={mockComponent} />
      </BrowserRouter>,
    );

    expect(screen.getByText("UI")).toBeInTheDocument();
  });

  it("has back link to components page", () => {
    render(
      <BrowserRouter>
        <ComponentDetail component={mockComponent} />
      </BrowserRouter>,
    );

    const backLink = screen.getByText(/← Back to Components/);
    expect(backLink).toHaveAttribute("href", "/components");
  });

  it("renders tabs including Preview", () => {
    render(
      <BrowserRouter>
        <ComponentDetail component={mockComponent} />
      </BrowserRouter>,
    );

    expect(screen.getByRole("tab", { name: /Preview/ })).toBeInTheDocument();
  });

  it("renders props tab when props exist", () => {
    render(
      <BrowserRouter>
        <ComponentDetail component={mockComponent} />
      </BrowserRouter>,
    );

    expect(screen.getByRole("tab", { name: "Props" })).toBeInTheDocument();
  });

  it("renders source code tab", () => {
    render(
      <BrowserRouter>
        <ComponentDetail component={mockComponent} />
      </BrowserRouter>,
    );

    expect(screen.getByRole("tab", { name: "Code" })).toBeInTheDocument();
  });

  it("shows preview count badge when previews exist", () => {
    render(
      <BrowserRouter>
        <ComponentDetail component={mockComponent} />
      </BrowserRouter>,
    );

    // Should show count badge for 2 previews
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("does not show preview count when no previews", () => {
    render(
      <BrowserRouter>
        <ComponentDetail component={mockComponentNoExamples} />
      </BrowserRouter>,
    );

    // Should not show any count badge
    expect(screen.queryByText("0")).not.toBeInTheDocument();
  });
});
