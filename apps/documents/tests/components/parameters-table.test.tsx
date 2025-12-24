import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { HookParameter } from "~/types/hook-metadata";
import ParametersTable from "~/components/parameters-table";

const mockParameters: HookParameter[] = [
  {
    name: "initialValue",
    type: "T",
    required: true,
    description: "The initial value for the state",
  },
  {
    name: "options",
    type: "UseStateOptions<T>",
    required: false,
    description: "Optional configuration",
    defaultValue: "{}",
  },
];

describe("ParametersTable", () => {
  it("renders all columns correctly", () => {
    render(<ParametersTable parameters={mockParameters} />);

    expect(screen.getByTestId("parameters-table")).toBeInTheDocument();
    expect(
      screen.getByRole("columnheader", { name: "Parameter" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("columnheader", { name: "Type" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("columnheader", { name: "Default" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("columnheader", { name: "Required" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("columnheader", { name: "Description" }),
    ).toBeInTheDocument();
  });

  it("renders parameter names", () => {
    render(<ParametersTable parameters={mockParameters} />);

    expect(screen.getByText("initialValue")).toBeInTheDocument();
    expect(screen.getByText("options")).toBeInTheDocument();
  });

  it("displays required indicator", () => {
    render(<ParametersTable parameters={mockParameters} />);

    const requiredBadges = screen.getAllByTestId("required-badge");
    expect(requiredBadges).toHaveLength(1);
    expect(requiredBadges[0]).toHaveTextContent("Required");
  });

  it("shows default values when present", () => {
    render(<ParametersTable parameters={mockParameters} />);

    expect(screen.getByText("{}")).toBeInTheDocument();
  });

  it("handles empty parameters array", () => {
    render(<ParametersTable parameters={[]} />);

    expect(screen.getByTestId("parameters-table-empty")).toBeInTheDocument();
    expect(
      screen.getByText("This hook takes no parameters."),
    ).toBeInTheDocument();
  });

  it("renders correct number of rows", () => {
    render(<ParametersTable parameters={mockParameters} />);

    const rows = screen.getAllByTestId("parameters-table-row");
    expect(rows).toHaveLength(2);
  });
});
