import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router";

import CategorySidebar from "~/components/category-sidebar";

describe("CategorySidebar", () => {
  it("renders all categories", () => {
    render(
      <BrowserRouter>
        <CategorySidebar currentCategory="form" />
      </BrowserRouter>,
    );

    expect(screen.getByText("Form")).toBeInTheDocument();
    expect(screen.getByText("Layout")).toBeInTheDocument();
    expect(screen.getByText("Feedback")).toBeInTheDocument();
    expect(screen.getByText("Data Display")).toBeInTheDocument();
    expect(screen.getByText("Navigation")).toBeInTheDocument();
    expect(screen.getByText("Uncategorized")).toBeInTheDocument();
  });

  it("highlights active category", () => {
    render(
      <BrowserRouter>
        <CategorySidebar currentCategory="form" />
      </BrowserRouter>,
    );

    const formLink = screen.getByRole("link", { name: "Form" });
    expect(formLink).toHaveClass("bg-gray-100");
  });

  it("toggles mobile menu", async () => {
    const user = userEvent.setup();
    render(
      <BrowserRouter>
        <CategorySidebar currentCategory="form" />
      </BrowserRouter>,
    );

    const menuButton = screen.getByLabelText("Toggle menu");
    await user.click(menuButton);

    // Menu should be visible (translate-x-0)
    const sidebar = screen.getByRole("complementary");
    expect(sidebar).toHaveClass("translate-x-0");
  });
});

