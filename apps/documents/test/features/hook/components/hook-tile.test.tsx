import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";

import { hookCatalogue } from "~/constants/docs-catalogue";
import HookTile from "~/features/hook/components/hook-tile";

describe("a hook tile", () => {
  it("carries the hook's sentence and never spans two columns", () => {
    const entry = hookCatalogue.items.find(
      (item) => item.slug === "use-debounce",
    );
    if (!entry) throw new Error("`use-debounce` is missing from the catalogue");

    render(
      <MemoryRouter>
        <HookTile
          entry={{ ...entry, exports: Array(12).fill("useDebounce") }}
        />
      </MemoryRouter>,
    );

    const link = screen.getByRole("link", { name: /^use-debounce/ });
    expect(link).toHaveTextContent(/debounce/i);
    expect(screen.getByRole("listitem")).not.toHaveClass("md:col-span-2");
  });
});
