import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router";
import { describe, expect, it } from "vitest";

import type { HookMetadata } from "~/types/hook-metadata";
import HookDetail from "~/components/hook-detail";

const mockHook: HookMetadata = {
  id: "use-debounce",
  name: "useDebounce",
  description: "A hook for managing local component state",
  category: "Client-side",
  package: "hook",
  filePath: "packages/hooks/src/use-debounce.ts",
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
  sourceCode: `export function useDebounce<T>(initialValue: T) {
  // implementation
}`,
  previews: ["const [count, setCount] = useState(0);"],
};

const mockHookNoExamples: HookMetadata = {
  ...mockHook,
  id: "use-no-preview-registry",
  name: "useNoPreview",
  previews: undefined,
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

    expect(screen.getByText("useDebounce")).toBeInTheDocument();
    expect(
      screen.getByText("A hook for managing local component state"),
    ).toBeInTheDocument();
  });

  it("does not show category badge (removed per AC4)", () => {
    render(
      <BrowserRouter>
        <HookDetail hook={mockHook} />
      </BrowserRouter>,
    );

    // Category badge should no longer appear - only package badge remains
    expect(screen.queryByText("Client-side")).not.toBeInTheDocument();
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

  it("renders usage preview when hook has a registered preview", () => {
    render(
      <BrowserRouter>
        <HookDetail hook={mockHook} />
      </BrowserRouter>,
    );

    expect(screen.getByText("Usage Preview")).toBeInTheDocument();
  });

  it("does not render usage preview when hook is not in preview registry", () => {
    render(
      <BrowserRouter>
        <HookDetail hook={mockHookNoExamples} />
      </BrowserRouter>,
    );

    expect(screen.queryByText("Usage Preview")).not.toBeInTheDocument();
  });
});
