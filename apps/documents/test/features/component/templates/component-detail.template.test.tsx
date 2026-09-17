import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import { describe, expect, it } from "vitest";

import { componentCatalogue } from "~/constants/docs-catalogue";
import { ROUTES } from "~/constants/routes";
import ComponentDetailTemplate from "~/features/component/templates/component-detail.template";

/**
 * The two things this template decides: does `:slug` name a primitive in the
 * generated catalogue, and which entries sit either side of it. Everything else
 * on the page is the catalogue's data rendered through shared components, each
 * covered where it lives.
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

function entryAt(index: number) {
  const entry = componentCatalogue.items.at(index);
  if (!entry) throw new Error(`no catalogue entry at ${index}`);
  return entry;
}

describe("the component detail page", () => {
  it("renders the primitive's exports as a list for a slug in the catalogue", () => {
    const entry = componentCatalogue.items.find(
      (item) => item.slug === "button",
    );
    if (!entry) throw new Error("`button` is missing from the catalogue");

    renderAtSlug(entry.slug);

    expect(
      screen.getByRole("heading", { level: 1, name: entry.slug }),
    ).toBeInTheDocument();

    // A chip per export, in the generator's order. A `listitem` takes no name
    // from its content, so the list is read as text rather than by name.
    expect(
      screen.getAllByRole("listitem").map((chip) => chip.textContent),
    ).toEqual(entry.exports);
  });

  it("shows the consumer's npm specifier, never the workspace name", () => {
    renderAtSlug("button");

    // The snippet is the thing a reader pastes into their own project, where
    // `@monorepo/ui` does not resolve.
    expect(
      screen.getByText(/from "@fe-monorepo\/ui\/components\/button"/),
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

  it("embeds that primitive's Default story from Storybook as the example", () => {
    const entry = componentCatalogue.items.find(
      (item) => item.slug === "button",
    );
    if (!entry) throw new Error("`button` is missing from the catalogue");

    renderAtSlug(entry.slug);

    // The story alone (`viewMode=story`), not the docs page: the docs page is
    // what the hero's link opens, and embedding it would show the whole
    // props table twice.
    expect(
      screen.getByTitle(`Ví dụ ${entry.slug} trên Storybook`),
    ).toHaveAttribute(
      "src",
      expect.stringContaining(
        `iframe.html?id=${entry.storybookExampleId}&viewMode=story`,
      ),
    );
  });

  it("links to both neighbours in catalogue order from an entry in the middle", () => {
    const [prev, entry, next] = [entryAt(20), entryAt(21), entryAt(22)];

    renderAtSlug(entry.slug);

    expect(
      screen.getByRole("link", { name: `Trước: ${prev.slug}` }),
    ).toHaveAttribute("href", ROUTES.componentBySlugPath(prev.slug));
    expect(
      screen.getByRole("link", { name: `Sau: ${next.slug}` }),
    ).toHaveAttribute("href", ROUTES.componentBySlugPath(next.slug));
  });

  it("has no previous link on the first entry and no next link on the last", () => {
    const first = renderAtSlug(entryAt(0).slug);
    expect(screen.queryByRole("link", { name: /^Trước:/ })).toBeNull();
    expect(
      screen.getByRole("link", { name: `Sau: ${entryAt(1).slug}` }),
    ).toBeInTheDocument();
    first.unmount();

    renderAtSlug(entryAt(-1).slug);
    expect(screen.queryByRole("link", { name: /^Sau:/ })).toBeNull();
    expect(
      screen.getByRole("link", { name: `Trước: ${entryAt(-2).slug}` }),
    ).toBeInTheDocument();
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
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /Storybook/ })).toBeNull();
  });
});
