import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import IslandFallback from "~/components/exception/island-fallback";

describe("IslandFallback", () => {
  it("shows the fallback copy and calls resetErrorBoundary from Retry", async () => {
    const user = userEvent.setup();
    const resetErrorBoundary = vi.fn();

    render(
      <IslandFallback
        error={new Error("boom")}
        resetErrorBoundary={resetErrorBoundary}
      />,
    );

    expect(screen.getByText("This section couldn't load.")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Retry" }));

    expect(resetErrorBoundary).toHaveBeenCalledTimes(1);
  });
});
