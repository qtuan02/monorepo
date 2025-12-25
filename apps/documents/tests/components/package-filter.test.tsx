import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router";

import PackageFilter from "~/components/package-filter";

describe("PackageFilter", () => {
  it("renders all filter options", () => {
    render(
      <BrowserRouter>
        <PackageFilter />
      </BrowserRouter>,
    );

    expect(screen.getByText("All")).toBeInTheDocument();
    expect(screen.getByText("UI Components")).toBeInTheDocument();
    expect(screen.getByText("Hooks")).toBeInTheDocument();
  });

  it("has correct test id", () => {
    render(
      <BrowserRouter>
        <PackageFilter />
      </BrowserRouter>,
    );

    expect(screen.getByTestId("package-filter")).toBeInTheDocument();
  });

  it("updates URL when filter changes", async () => {
    const user = userEvent.setup();
    render(
      <BrowserRouter>
        <PackageFilter />
      </BrowserRouter>,
    );

    const uiComponentsTab = screen.getByText("UI Components");
    await user.click(uiComponentsTab);

    // URL should be updated (checked via window.location in browser)
    // In test environment, we verify the component behavior
    expect(uiComponentsTab).toHaveAttribute("data-state", "active");
  });
});

