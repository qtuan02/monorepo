import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { CodeBlock } from "~/components/code/code-block";

describe("CodeBlock", () => {
  it("renders a token array as spans, and copies the joined plain text", async () => {
    // `userEvent.setup()` installs its own clipboard stub over jsdom, which
    // has none — so the copy is read back from it rather than from a mock.
    const user = userEvent.setup();

    render(
      <CodeBlock
        code={[
          { kind: "keyword", text: "@import" },
          " ",
          { kind: "string", text: '"tailwindcss"' },
          ";",
        ]}
      />,
    );

    // The highlighting is spans over the same characters — no highlighter.
    expect(screen.getByText("@import")).toHaveAttribute(
      "data-token",
      "keyword",
    );
    expect(screen.getByText('"tailwindcss"')).toHaveAttribute(
      "data-token",
      "string",
    );

    const button = screen.getByRole("button", { name: "Sao chép đoạn mã" });
    await user.click(button);

    expect(await navigator.clipboard.readText()).toBe('@import "tailwindcss";');
    expect(
      await screen.findByRole("button", { name: "Đã sao chép" }),
    ).toBeInTheDocument();
  });

  it("still takes a plain string", () => {
    render(<CodeBlock code="bun add @fe-monorepo/ui" />);

    expect(screen.getByText("bun add @fe-monorepo/ui")).toBeInTheDocument();
  });
});
