import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import IslandBoundary from "~/components/exception/island-boundary";

/** Throws while `shouldThrow()` says so — a mutable escape hatch so the same
 * child can "recover" once Retry is clicked, without a real query behind it. */
function Bomb({ shouldThrow }: { shouldThrow: () => boolean }) {
  if (shouldThrow()) throw new Error("Boom");
  return <p>Real content</p>;
}

describe("IslandBoundary", () => {
  beforeEach(() => {
    // React 19 still logs a caught render error to the console; the fallback
    // is the user-facing proof, this just keeps the test output clean.
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.mocked(console.error).mockRestore();
  });

  it("shows the Island fallback once its content throws", () => {
    render(
      <QueryClientProvider client={new QueryClient()}>
        <IslandBoundary queryKey={["thing"]}>
          <Bomb shouldThrow={() => true} />
        </IslandBoundary>
      </QueryClientProvider>,
    );

    expect(screen.getByRole("button", { name: "Retry" })).toBeInTheDocument();
    expect(screen.queryByText("Real content")).not.toBeInTheDocument();
  });

  it("resets exactly its own query key and remounts the content on Retry", async () => {
    const user = userEvent.setup();
    const queryClient = new QueryClient();
    const resetQueriesSpy = vi.spyOn(queryClient, "resetQueries");
    let shouldThrow = true;

    render(
      <QueryClientProvider client={queryClient}>
        <IslandBoundary queryKey={["conversation"]}>
          <Bomb shouldThrow={() => shouldThrow} />
        </IslandBoundary>
      </QueryClientProvider>,
    );

    expect(screen.getByRole("button", { name: "Retry" })).toBeInTheDocument();
    shouldThrow = false;
    await user.click(screen.getByRole("button", { name: "Retry" }));

    expect(resetQueriesSpy).toHaveBeenCalledExactlyOnceWith({
      queryKey: ["conversation"],
    });
    expect(
      screen.queryByRole("button", { name: "Retry" }),
    ).not.toBeInTheDocument();
    expect(screen.getByText("Real content")).toBeInTheDocument();
  });

  it("resets every key when queryKey is a list of query keys", async () => {
    const user = userEvent.setup();
    const queryClient = new QueryClient();
    const resetQueriesSpy = vi.spyOn(queryClient, "resetQueries");
    let shouldThrow = true;

    render(
      <QueryClientProvider client={queryClient}>
        <IslandBoundary
          queryKey={[
            ["message", "list", { conversationId: "c1" }],
            ["conversation"],
          ]}
        >
          <Bomb shouldThrow={() => shouldThrow} />
        </IslandBoundary>
      </QueryClientProvider>,
    );

    shouldThrow = false;
    await user.click(screen.getByRole("button", { name: "Retry" }));

    expect(resetQueriesSpy).toHaveBeenCalledWith({
      queryKey: ["message", "list", { conversationId: "c1" }],
    });
    expect(resetQueriesSpy).toHaveBeenCalledWith({
      queryKey: ["conversation"],
    });
  });

  it("resets on a resetKeys change with no click, once it has already caught", async () => {
    let shouldThrow = true;
    const { rerender } = render(
      <QueryClientProvider client={new QueryClient()}>
        <IslandBoundary queryKey={["message"]} resetKeys={["c1"]}>
          <Bomb shouldThrow={() => shouldThrow} />
        </IslandBoundary>
      </QueryClientProvider>,
    );

    expect(screen.getByRole("button", { name: "Retry" })).toBeInTheDocument();

    shouldThrow = false;
    rerender(
      <QueryClientProvider client={new QueryClient()}>
        <IslandBoundary queryKey={["message"]} resetKeys={["c2"]}>
          <Bomb shouldThrow={() => shouldThrow} />
        </IslandBoundary>
      </QueryClientProvider>,
    );

    expect(
      screen.queryByRole("button", { name: "Retry" }),
    ).not.toBeInTheDocument();
    expect(screen.getByText("Real content")).toBeInTheDocument();
  });
});
