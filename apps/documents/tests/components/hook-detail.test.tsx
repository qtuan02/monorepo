import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router";
import { describe, expect, it } from "vitest";

import type { HookMetadata } from "~/types/hook-metadata";
import HookDetail from "~/components/hook-detail";

const mockHook: HookMetadata = {
  id: "use-state",
  name: "useState",
  description: "A hook for managing local component state",
  category: "Client-side",
  package: "hook",
  filePath: "packages/hooks/src/use-state.ts",
  parameters: [
    {
      name: "initialValue",
      type: "T",
      required: true,
      description: "The initial state value",
    },
  ],
  returns: {
    type: "[T, (value: T) => void]",
    description: "A tuple with current value and setter",
  },
  sourceCode: `export function useState<T>(initialValue: T) {
  // implementation
}`,
  examples: ["const [count, setCount] = useState(0);"],
};

const mockHookNoExamples: HookMetadata = {
  ...mockHook,
  examples: undefined,
};

describe("HookDetail", () => {
  it("renders hook detail", () => {
    render(
      <BrowserRouter>
        <HookDetail hook={mockHook} />
      </BrowserRouter>,
    );

    expect(screen.getByTestId("hook-detail")).toBeInTheDocument();
  });

  it("displays hook name and description", () => {
    render(
      <BrowserRouter>
        <HookDetail hook={mockHook} />
      </BrowserRouter>,
    );

    expect(screen.getByText("useState")).toBeInTheDocument();
    expect(
      screen.getByText("A hook for managing local component state"),
    ).toBeInTheDocument();
  });

  it("shows category badge", () => {
    render(
      <BrowserRouter>
        <HookDetail hook={mockHook} />
      </BrowserRouter>,
    );

    expect(screen.getByText("Client-side")).toBeInTheDocument();
  });

  it("has back link to hooks page", () => {
    render(
      <BrowserRouter>
        <HookDetail hook={mockHook} />
      </BrowserRouter>,
    );

    const backLink = screen.getByText(/← Back to Hooks/);
    expect(backLink).toHaveAttribute("href", "/hooks");
  });

  it("renders parameters section", () => {
    render(
      <BrowserRouter>
        <HookDetail hook={mockHook} />
      </BrowserRouter>,
    );

    expect(screen.getByText("Parameters")).toBeInTheDocument();
    expect(screen.getByTestId("parameters-table")).toBeInTheDocument();
  });

  it("renders source code section", () => {
    render(
      <BrowserRouter>
        <HookDetail hook={mockHook} />
      </BrowserRouter>,
    );

    expect(screen.getByText("Source Code")).toBeInTheDocument();
    // There might be multiple code-viewer elements (source code + examples)
    const codeViewers = screen.getAllByTestId("code-viewer");
    expect(codeViewers.length).toBeGreaterThanOrEqual(1);
  });

  it("renders examples section when examples exist", () => {
    render(
      <BrowserRouter>
        <HookDetail hook={mockHook} />
      </BrowserRouter>,
    );

    expect(screen.getByText("Examples")).toBeInTheDocument();
  });

  it("does not render examples section when no examples", () => {
    render(
      <BrowserRouter>
        <HookDetail hook={mockHookNoExamples} />
      </BrowserRouter>,
    );

    expect(screen.queryByText("Examples")).not.toBeInTheDocument();
  });
});
