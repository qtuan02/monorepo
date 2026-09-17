import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";

import type { ComponentDocsEntry } from "~/types/docs-catalogue";
import ComponentTile from "~/features/component/components/component-tile";

/** A primitive with `count` exports named `Export1…ExportN`. */
function entryWith(count: number): ComponentDocsEntry {
  return {
    slug: "probe",
    subpath: "components/probe",
    importPath: "@fe-monorepo/ui/components/probe",
    exports: Array.from({ length: count }, (_, index) => `Export${index + 1}`),
    description: null,
    storybookDocsId: "components-probe",
    storybookExampleId: "components-probe--default",
  };
}

function renderCard(entry: ComponentDocsEntry) {
  return render(
    <MemoryRouter>
      <ComponentTile entry={entry} />
    </MemoryRouter>,
  );
}

describe("a component tile", () => {
  it("spans two columns from ten exports, and one below that", () => {
    // The span sits on the grid item — the `<li>` — not on the link inside
    // it, where a column class would be a no-op the grid never sees.
    const { unmount } = renderCard(entryWith(10));
    expect(screen.getByRole("listitem")).toHaveClass("md:col-span-2");
    unmount();

    renderCard(entryWith(9));
    expect(screen.getByRole("listitem")).not.toHaveClass("md:col-span-2");
  });

  it("names the link by the slug first, then previews three exports and the rest as +n", () => {
    renderCard(entryWith(5));

    const link = screen.getByRole("link", { name: /^probe/ });
    expect(link).toHaveTextContent("Export1, Export2, Export3, +2");
    expect(link).not.toHaveTextContent("Export4");
    // The count sits in its own corner, not in the preview.
    expect(link).toHaveTextContent(/5$/);
  });

  it("lists every export, and no +n, when there are three or fewer", () => {
    renderCard(entryWith(3));

    const link = screen.getByRole("link");
    expect(link).toHaveTextContent("Export1, Export2, Export3");
    expect(link).not.toHaveTextContent("+");
  });
});
