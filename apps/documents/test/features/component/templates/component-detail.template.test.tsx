import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import { describe, expect, it } from "vitest";

import { componentCatalogue } from "~/constants/docs-catalogue";
import { ROUTES } from "~/constants/routes";
import ComponentDetailTemplate from "~/features/component/templates/component-detail.template";

/**
 * The one branch this template actually decides: does `:slug` name a primitive
 * in the generated catalogue, or not. Everything else on the page is the
 * catalogue's data rendered through shared components, each covered where it
 * lives.
 *
 * The route is mounted rather than the template rendered bare, because the slug
 * arrives through `useParams` — driving it through the real path is also what
 * proves `ROUTES.componentBySlugPath` and `ROUTES.COMPONENT_BY_SLUG` still
 * describe the same route.
 */
function renderAtSlug(slug: string) {
  return render(
    <MemoryRouter initialEntries={[ROUTES.componentBySlugPath(slug)]}>
      <Routes>
        <Route
          path={ROUTES.COMPONENT_BY_SLUG}
          element={<ComponentDetailTemplate />}
        />
      </Routes>
    </MemoryRouter>,
  );
}

describe("the component detail page", () => {
  it("renders the primitive's export table for a slug in the catalogue", () => {
    const entry = componentCatalogue.items.find(
      (item) => item.slug === "button",
    );
    if (!entry) throw new Error("`button` is missing from the catalogue");

    renderAtSlug(entry.slug);

    expect(
      screen.getByRole("heading", { level: 1, name: entry.slug }),
    ).toBeInTheDocument();

    for (const name of entry.exports) {
      expect(screen.getByRole("cell", { name })).toBeInTheDocument();
    }
  });

  it("shows the consumer's npm specifier, never the workspace name", () => {
    renderAtSlug("button");

    // The snippet is the thing a reader pastes into their own project, where
    // `@monorepo/ui` does not resolve.
    expect(
      screen.getByText(/@fe-monorepo\/ui\/components\/button/),
    ).toBeInTheDocument();
    expect(screen.queryByText(/@monorepo\/ui/)).not.toBeInTheDocument();
  });

  it("links the demo out to that primitive's Storybook docs page", () => {
    const entry = componentCatalogue.items.find(
      (item) => item.slug === "button",
    );
    if (!entry) throw new Error("`button` is missing from the catalogue");

    renderAtSlug(entry.slug);

    const link = screen.getByRole("link", { name: /Storybook/ });

    expect(link).toHaveAttribute(
      "href",
      expect.stringContaining(`path=/docs/${entry.storybookDocsId}--docs`),
    );
  });

  it("404s in place for a slug no primitive has", () => {
    renderAtSlug("not-a-primitive");

    // Rendered where the wrong URL was typed rather than redirected, so the
    // message can name the slug that missed.
    expect(
      screen.getByRole("heading", { level: 1, name: "Không tìm thấy" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/not-a-primitive/)).toBeInTheDocument();

    // And nothing from the happy path leaks through the early return.
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });
});
