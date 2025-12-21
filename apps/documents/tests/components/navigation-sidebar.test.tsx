import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router";

import NavigationSidebar from "~/components/navigation-sidebar";

describe("NavigationSidebar", () => {
  it("renders both components and hooks sections", () => {
    render(
      <BrowserRouter>
        <NavigationSidebar currentPath="/components/form" />
      </BrowserRouter>,
    );

    expect(screen.getByText("Components")).toBeInTheDocument();
    expect(screen.getByText("Hooks")).toBeInTheDocument();
  });

  it("renders all component categories", () => {
    render(
      <BrowserRouter>
        <NavigationSidebar currentPath="/components/form" />
      </BrowserRouter>,
    );

    expect(screen.getByText("Form")).toBeInTheDocument();
    expect(screen.getByText("Layout")).toBeInTheDocument();
    expect(screen.getByText("Feedback")).toBeInTheDocument();
    expect(screen.getByText("Data Display")).toBeInTheDocument();
    expect(screen.getByText("Navigation")).toBeInTheDocument();
  });

  it("renders all hook categories", () => {
    render(
      <BrowserRouter>
        <NavigationSidebar currentPath="/hooks/client-side" />
      </BrowserRouter>,
    );

    expect(screen.getByText("Client-side")).toBeInTheDocument();
    expect(screen.getByText("Utilities")).toBeInTheDocument();
    // Use getAllByText since "Uncategorized" appears in both sections
    const uncategorizedLinks = screen.getAllByText("Uncategorized");
    expect(uncategorizedLinks.length).toBeGreaterThan(0);
    // Verify hook section has Uncategorized link
    const hookUncategorizedLink = uncategorizedLinks.find((link) =>
      link.getAttribute("href")?.includes("/hooks/uncategorized"),
    );
    expect(hookUncategorizedLink).toBeInTheDocument();
  });

  it("highlights active component category", () => {
    // Mock location by navigating to the path
    window.history.pushState({}, "", "/components/form");
    
    const { container } = render(
      <BrowserRouter>
        <NavigationSidebar currentPath="/components/form" />
      </BrowserRouter>,
    );

    // Find the form link and check if it has active styling
    const formLink = container.querySelector('a[href="/components/form"]');
    expect(formLink?.className).toContain("bg-gray-100");
  });

  it("highlights active hook category", () => {
    // Mock location by navigating to the path
    window.history.pushState({}, "", "/hooks/client-side");
    
    const { container } = render(
      <BrowserRouter>
        <NavigationSidebar currentPath="/hooks/client-side" />
      </BrowserRouter>,
    );

    // Find the client-side link and check if it has active styling
    const clientSideLink = container.querySelector('a[href="/hooks/client-side"]');
    expect(clientSideLink?.className).toContain("bg-gray-100");
  });

  it("toggles mobile menu", async () => {
    const user = userEvent.setup();
    render(
      <BrowserRouter>
        <NavigationSidebar currentPath="/components/form" />
      </BrowserRouter>,
    );

    const menuButton = screen.getByLabelText("Toggle menu");
    await user.click(menuButton);

    const sidebar = screen.getByRole("complementary");
    expect(sidebar).toHaveClass("translate-x-0");
  });
});

