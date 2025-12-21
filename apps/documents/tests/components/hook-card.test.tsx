import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router";

import HookCard from "~/components/hook-card";
import type { HookMetadata } from "~/types/hook-metadata";

const mockHook: HookMetadata = {
  id: "use-toggle",
  name: "useToggle",
  description: "A hook for toggling boolean state",
  category: "Client-side",
  package: "hook",
  filePath: "use-toggle.ts",
  parameters: [],
  returns: { type: "boolean" },
  sourceCode: "",
};

describe("HookCard", () => {
  it("renders hook name and description", () => {
    render(
      <BrowserRouter>
        <HookCard hook={mockHook} />
      </BrowserRouter>,
    );

    expect(screen.getByText("useToggle")).toBeInTheDocument();
    expect(screen.getByText("A hook for toggling boolean state")).toBeInTheDocument();
  });

  it("has correct test id", () => {
    render(
      <BrowserRouter>
        <HookCard hook={mockHook} />
      </BrowserRouter>,
    );

    expect(screen.getByTestId("hook-card")).toBeInTheDocument();
  });

  it("links to hook detail page", () => {
    render(
      <BrowserRouter>
        <HookCard hook={mockHook} />
      </BrowserRouter>,
    );

    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/hooks/client-side/use-toggle");
  });

  it("displays category badge", () => {
    render(
      <BrowserRouter>
        <HookCard hook={mockHook} />
      </BrowserRouter>,
    );

    expect(screen.getByText("Client-side")).toBeInTheDocument();
  });

  it("displays package badge", () => {
    render(
      <BrowserRouter>
        <HookCard hook={mockHook} />
      </BrowserRouter>,
    );

    expect(screen.getByText("Hook")).toBeInTheDocument();
  });
});

