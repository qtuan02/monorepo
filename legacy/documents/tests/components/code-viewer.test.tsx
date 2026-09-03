import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import CodeViewer from "~/components/code-viewer";

const mockCode = `import { Button } from "@monorepo/ui";

export function MyComponent() {
  return (
    <Button variant="primary">
      Click me
    </Button>
  );
}`;

// Mock clipboard API
const mockClipboard = {
  writeText: vi.fn().mockResolvedValue(undefined),
};

beforeEach(() => {
  vi.clearAllMocks();
  Object.defineProperty(navigator, "clipboard", {
    value: mockClipboard,
    writable: true,
  });
});

describe("CodeViewer", () => {
  it("renders code content", () => {
    render(<CodeViewer code={mockCode} language="tsx" />);

    expect(screen.getByTestId("code-viewer")).toBeInTheDocument();
    expect(screen.getByText(/import/)).toBeInTheDocument();
  });

  it("displays language badge", () => {
    render(<CodeViewer code={mockCode} language="tsx" />);

    expect(screen.getByText("tsx")).toBeInTheDocument();
  });

  it("displays filename when provided", () => {
    render(
      <CodeViewer code={mockCode} language="tsx" filename="my-component.tsx" />,
    );

    expect(screen.getByText("my-component.tsx")).toBeInTheDocument();
  });

  it("renders line numbers by default", () => {
    render(<CodeViewer code={mockCode} language="tsx" />);

    const lineNumbers = screen.getAllByTestId("line-number");
    expect(lineNumbers.length).toBeGreaterThan(0);
    expect(lineNumbers[0]).toHaveTextContent("1");
  });

  it("toggles line numbers", () => {
    render(<CodeViewer code={mockCode} language="tsx" />);

    // Initially visible
    expect(screen.getAllByTestId("line-number").length).toBeGreaterThan(0);

    // Click toggle button
    const toggleButton = screen.getByText("Hide #");
    fireEvent.click(toggleButton);

    // Line numbers should be hidden
    expect(screen.queryAllByTestId("line-number")).toHaveLength(0);

    // Click again to show
    const showButton = screen.getByText("Show #");
    fireEvent.click(showButton);

    expect(screen.getAllByTestId("line-number").length).toBeGreaterThan(0);
  });

  it("has copy button", () => {
    render(<CodeViewer code={mockCode} language="tsx" />);

    expect(screen.getByTestId("copy-button")).toBeInTheDocument();
    expect(screen.getByText("Copy")).toBeInTheDocument();
  });

  it("copies code to clipboard on button click", async () => {
    render(<CodeViewer code={mockCode} language="tsx" />);

    const copyButton = screen.getByTestId("copy-button");
    fireEvent.click(copyButton);

    await waitFor(() => {
      expect(mockClipboard.writeText).toHaveBeenCalledWith(mockCode);
    });
  });

  it("shows copied feedback after copy", async () => {
    render(<CodeViewer code={mockCode} language="tsx" />);

    const copyButton = screen.getByTestId("copy-button");
    fireEvent.click(copyButton);

    await waitFor(() => {
      expect(screen.getByText("Copied!")).toBeInTheDocument();
    });
  });

  it("handles empty code", () => {
    render(<CodeViewer code="" language="tsx" />);

    expect(screen.getByTestId("code-viewer-empty")).toBeInTheDocument();
    expect(screen.getByText("No source code available.")).toBeInTheDocument();
  });

  it("handles large code blocks", () => {
    const largeCode = Array(100).fill("const x = 1;").join("\n");
    render(<CodeViewer code={largeCode} language="tsx" />);

    const lineNumbers = screen.getAllByTestId("line-number");
    expect(lineNumbers).toHaveLength(100);
  });
});
