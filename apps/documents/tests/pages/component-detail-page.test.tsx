import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import { describe, expect, it, vi } from "vitest";

import type { ComponentMetadata } from "~/types/component-metadata";
import ComponentDetailPage from "~/pages/component-detail-page";

// Mock the useComponentById hook
const mockComponent: ComponentMetadata = {
  id: "button",
  name: "Button",
  description: "A button component",
  category: "ui",
  parentCategory: "shadcn",
  package: "ui",
  filePath: "button.tsx",
  props: [],
  sourceCode: "export function Button() {}",
};

vi.mock("~/hooks/use-component-metadata", () => ({
  useComponentMetadata: () => ({ components: [], isLoading: false }),
  useComponentById: vi.fn((id: string) => {
    if (id === "button") {
      return { component: mockComponent, isLoading: false };
    }
    return { component: null, isLoading: false };
  }),
}));

// Mock AppLayout
vi.mock("~/components/app-layout", () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="app-layout">{children}</div>
  ),
}));

// Mock ComponentDetail
vi.mock("~/components/component-detail", () => ({
  default: ({ component }: { component: ComponentMetadata }) => (
    <div data-testid="component-detail">{component.name} Detail</div>
  ),
}));

describe("ComponentDetailPage", () => {
  it("renders component detail for valid route", () => {
    render(
      <MemoryRouter initialEntries={["/components/button"]}>
        <Routes>
          <Route path="/components/:id" element={<ComponentDetailPage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByTestId("component-detail")).toBeInTheDocument();
    expect(screen.getByText("Button Detail")).toBeInTheDocument();
  });

  it("renders breadcrumb navigation", () => {
    render(
      <MemoryRouter initialEntries={["/components/button"]}>
        <Routes>
          <Route path="/components/:id" element={<ComponentDetailPage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByTestId("breadcrumb")).toBeInTheDocument();
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Components")).toBeInTheDocument();
    expect(screen.getByText("Button")).toBeInTheDocument();
  });

  it("shows error for non-existent component", () => {
    render(
      <MemoryRouter initialEntries={["/components/non-existent"]}>
        <Routes>
          <Route path="/components/:id" element={<ComponentDetailPage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText("Component Not Found")).toBeInTheDocument();
  });

  it("has back link on error pages", () => {
    render(
      <MemoryRouter initialEntries={["/components/non-existent"]}>
        <Routes>
          <Route path="/components/:id" element={<ComponentDetailPage />} />
        </Routes>
      </MemoryRouter>,
    );

    const backLink = screen.getByText(/← Back to Components/);
    expect(backLink).toHaveAttribute("href", "/components");
  });
});
