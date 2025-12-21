import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router";

import SearchBar from "~/components/search-bar";

describe("SearchBar", () => {
  const mockSearchResults = [
    {
      id: "button",
      name: "Button",
      description: "A button component",
      category: "Form",
      type: "component" as const,
      package: "ui" as const,
    },
  ];

  const mockOnSearch = vi.fn((query: string) => {
    if (query.trim()) {
      return mockSearchResults;
    }
    return [];
  });

  it("renders search input", () => {
    render(
      <BrowserRouter>
        <SearchBar onSearch={mockOnSearch} />
      </BrowserRouter>,
    );

    expect(screen.getByTestId("search-bar")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Search components and hooks..."),
    ).toBeInTheDocument();
  });

  it("has accessible attributes", () => {
    render(
      <BrowserRouter>
        <SearchBar onSearch={mockOnSearch} />
      </BrowserRouter>,
    );

    const input = screen.getByTestId("search-bar");
    expect(input).toHaveAttribute("aria-label", "Search components and hooks");
    expect(input).toHaveAttribute("aria-expanded", "false");
    expect(input).toHaveAttribute("aria-haspopup", "listbox");
  });
});

