import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { HookReturn } from "~/types/hook-metadata";
import ReturnValue from "~/components/return-value";

const mockReturn: HookReturn = {
  type: "[T, (value: T) => void]",
  description: "A tuple containing the current value and a setter function",
};

const mockReturnNoDescription: HookReturn = {
  type: "void",
};

describe("ReturnValue", () => {
  it("renders return type correctly", () => {
    render(<ReturnValue returns={mockReturn} />);

    expect(screen.getByTestId("return-value")).toBeInTheDocument();
    expect(screen.getByTestId("return-type")).toHaveTextContent(
      "[T, (value: T) => void]",
    );
  });

  it("displays description when present", () => {
    render(<ReturnValue returns={mockReturn} />);

    expect(screen.getByTestId("return-description")).toHaveTextContent(
      "A tuple containing the current value and a setter function",
    );
  });

  it("handles return without description", () => {
    render(<ReturnValue returns={mockReturnNoDescription} />);

    expect(screen.getByTestId("return-type")).toHaveTextContent("void");
    expect(screen.queryByTestId("return-description")).not.toBeInTheDocument();
  });

  it("handles empty return value", () => {
    render(<ReturnValue returns={{ type: "" }} />);

    expect(screen.getByTestId("return-value-empty")).toBeInTheDocument();
    expect(screen.getByText("This hook returns void.")).toBeInTheDocument();
  });

  it("displays type with correct styling", () => {
    render(<ReturnValue returns={mockReturn} />);

    const typeElement = screen.getByTestId("return-type");
    expect(typeElement.tagName.toLowerCase()).toBe("code");
  });
});
