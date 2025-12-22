import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { ComponentProp } from "~/types/component-metadata";
import PropsTable from "~/components/props-table";

const mockProps: ComponentProp[] = [
  {
    name: "variant",
    type: '"primary" | "secondary"',
    required: true,
    description: "The visual style variant",
    defaultValue: "primary",
  },
  {
    name: "disabled",
    type: "boolean",
    required: false,
    description: "Whether the button is disabled",
  },
  {
    name: "onClick",
    type: "() => void",
    required: false,
  },
];

describe("PropsTable", () => {
  it("renders all columns correctly", () => {
    render(<PropsTable props={mockProps} />);

    expect(screen.getByTestId("props-table")).toBeInTheDocument();
    expect(screen.getByText("Prop")).toBeInTheDocument();
    expect(screen.getByText("Type")).toBeInTheDocument();
    expect(screen.getByText("Default")).toBeInTheDocument();
    expect(screen.getByText("Required")).toBeInTheDocument();
    expect(screen.getByText("Description")).toBeInTheDocument();
  });

  it("renders prop names", () => {
    render(<PropsTable props={mockProps} />);

    expect(screen.getByText("variant")).toBeInTheDocument();
    expect(screen.getByText("disabled")).toBeInTheDocument();
    expect(screen.getByText("onClick")).toBeInTheDocument();
  });

  it("displays required indicator", () => {
    render(<PropsTable props={mockProps} />);

    const requiredBadges = screen.getAllByTestId("required-badge");
    expect(requiredBadges).toHaveLength(1);
    expect(requiredBadges[0]).toHaveTextContent("Required");
  });

  it("shows default values when present", () => {
    render(<PropsTable props={mockProps} />);

    expect(screen.getByText("primary")).toBeInTheDocument();
  });

  it("handles empty props array", () => {
    render(<PropsTable props={[]} />);

    expect(screen.getByTestId("props-table-empty")).toBeInTheDocument();
    expect(
      screen.getByText("No props available for this component."),
    ).toBeInTheDocument();
  });

  it("renders correct number of rows", () => {
    render(<PropsTable props={mockProps} />);

    const rows = screen.getAllByTestId("props-table-row");
    expect(rows).toHaveLength(3);
  });

  it("handles complex type strings", () => {
    render(<PropsTable props={mockProps} />);

    expect(screen.getByText('"primary" | "secondary"')).toBeInTheDocument();
    expect(screen.getByText("boolean")).toBeInTheDocument();
  });
});
