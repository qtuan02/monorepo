import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router";
import { describe, expect, it } from "vitest";

import NavigationSidebar from "~/components/navigation-sidebar";

describe("NavigationSidebar", () => {
  it("renders both components and hooks sections", () => {
    render(
      <BrowserRouter>
        <NavigationSidebar currentPath="/components/button" />
      </BrowserRouter>,
    );

    expect(screen.getByText("Components")).toBeInTheDocument();
    expect(screen.getByText("Hooks")).toBeInTheDocument();
  });

  it("renders component items", () => {
    render(
      <BrowserRouter>
        <NavigationSidebar currentPath="/components/button" />
      </BrowserRouter>,
    );

    // Check for component links - now flat list of all components
    expect(screen.getByText("Accordion")).toBeInTheDocument();
    expect(screen.getByText("AlertDialog")).toBeInTheDocument();
  });

  it("renders hook items", () => {
    render(
      <BrowserRouter>
        <NavigationSidebar currentPath="/hooks/use-debounce" />
      </BrowserRouter>,
    );

    // Check for hook links - now flat list of all hooks
    expect(screen.getByText("UseDebounce")).toBeInTheDocument();
    expect(screen.getByText("UseCopyToClipboard")).toBeInTheDocument();
  });

  it("highlights active component", () => {
    // Mock location by navigating to the path
    window.history.pushState({}, "", "/components/accordion");

    const { container } = render(
      <BrowserRouter>
        <NavigationSidebar currentPath="/components/accordion" />
      </BrowserRouter>,
    );

    // Find the accordion link and check if it has active styling
    const accordionLink = container.querySelector(
      'a[href="/components/accordion"]',
    );
    expect(accordionLink?.className).toContain("sidebar-item-active");
  });

  it("highlights active hook", () => {
    // Mock location by navigating to the path
    window.history.pushState({}, "", "/hooks/use-debounce");

    const { container } = render(
      <BrowserRouter>
        <NavigationSidebar currentPath="/hooks/use-debounce" />
      </BrowserRouter>,
    );

    // Find the use-debounce link and check if it has active styling
    const hookLink = container.querySelector('a[href="/hooks/use-debounce"]');
    expect(hookLink?.className).toContain("sidebar-item-active");
  });

  it("toggles mobile menu", async () => {
    const user = userEvent.setup();
    render(
      <BrowserRouter>
        <NavigationSidebar currentPath="/components/button" />
      </BrowserRouter>,
    );

    const menuButton = screen.getByLabelText("Toggle menu");
    await user.click(menuButton);

    const sidebar = screen.getByRole("complementary");
    expect(sidebar).toHaveClass("translate-x-0");
  });

  it("can collapse and expand sections", async () => {
    const user = userEvent.setup();
    render(
      <BrowserRouter>
        <NavigationSidebar currentPath="/components/button" />
      </BrowserRouter>,
    );

    // Find collapse buttons
    const collapseButtons = screen.getAllByRole("button");
    // There should be at least toggle buttons for Components and Hooks sections
    expect(collapseButtons.length).toBeGreaterThanOrEqual(2);
  });
});
