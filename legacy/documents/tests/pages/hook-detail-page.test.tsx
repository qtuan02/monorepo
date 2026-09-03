import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import { describe, expect, it, vi } from "vitest";

import type { HookMetadata } from "~/types/hook-metadata";
import HookDetailPage from "~/pages/hook-detail-page";

// Mock the useHookById hook
const mockHook: HookMetadata = {
  id: "use-state",
  name: "useState",
  description: "A hook for state management",
  category: "Utilities",
  package: "hook",
  filePath: "use-state.ts",
  parameters: [],
  returns: { type: "void" },
  sourceCode: "export function useState() {}",
};

vi.mock("~/hooks/use-hook-metadata", () => ({
  useHookMetadata: () => ({ hooks: [], isLoading: false }),
  useHookById: vi.fn((id: string) => {
    if (id === "use-state") {
      return { hook: mockHook, isLoading: false };
    }
    return { hook: null, isLoading: false };
  }),
}));

// Mock AppLayout
vi.mock("~/components/app-layout", () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="app-layout">{children}</div>
  ),
}));

// Mock HookDetail
vi.mock("~/components/hook-detail", () => ({
  default: ({ hook }: { hook: HookMetadata }) => (
    <div data-testid="hook-detail">{hook.name} Detail</div>
  ),
}));

describe("HookDetailPage", () => {
  it("renders hook detail for valid route", () => {
    render(
      <MemoryRouter initialEntries={["/hooks/use-state"]}>
        <Routes>
          <Route path="/hooks/:id" element={<HookDetailPage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByTestId("hook-detail")).toBeInTheDocument();
    expect(screen.getByText("useState Detail")).toBeInTheDocument();
  });

  it("renders breadcrumb navigation", () => {
    render(
      <MemoryRouter initialEntries={["/hooks/use-state"]}>
        <Routes>
          <Route path="/hooks/:id" element={<HookDetailPage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByTestId("breadcrumb")).toBeInTheDocument();
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Hooks")).toBeInTheDocument();
    expect(screen.getByText("useState")).toBeInTheDocument();
  });

  it("shows error for non-existent hook", () => {
    render(
      <MemoryRouter initialEntries={["/hooks/non-existent"]}>
        <Routes>
          <Route path="/hooks/:id" element={<HookDetailPage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText("Hook Not Found")).toBeInTheDocument();
  });

  it("has back link on error pages", () => {
    render(
      <MemoryRouter initialEntries={["/hooks/non-existent"]}>
        <Routes>
          <Route path="/hooks/:id" element={<HookDetailPage />} />
        </Routes>
      </MemoryRouter>,
    );

    const backLink = screen.getByText(/← Back to Hooks/);
    expect(backLink).toHaveAttribute("href", "/hooks");
  });
});
