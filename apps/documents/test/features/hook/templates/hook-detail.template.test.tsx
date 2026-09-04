import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import { describe, expect, it } from "vitest";

import { hookCatalogue } from "~/constants/docs-catalogue";
import { ROUTES } from "~/constants/routes";
import HookDetailTemplate from "~/features/hook/templates/hook-detail.template";

function renderAtSlug(slug: string) {
  return render(
    <MemoryRouter initialEntries={[ROUTES.hookBySlugPath(slug)]}>
      <Routes>
        <Route path={ROUTES.HOOK_BY_SLUG} element={<HookDetailTemplate />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("the hook detail page", () => {
  it("renders the hook's export and its sentence from the shared catalogue", () => {
    const entry = hookCatalogue.items.find(
      (item) => item.slug === "use-debounce",
    );
    if (!entry) throw new Error("`use-debounce` is missing from the catalogue");

    renderAtSlug(entry.slug);

    expect(
      screen.getByRole("heading", { level: 1, name: entry.slug }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("cell", { name: "useDebounce" }),
    ).toBeInTheDocument();

    // The description is the one field the generator does not supply for a
    // hook — it comes from `documents.hooks.items.<slug>.description`, so a
    // hook added without its sentence would render the raw key here.
    expect(
      screen.getByText(/Trả lại value sau delay mili-giây/),
    ).toBeInTheDocument();
  });

  it("shows the consumer's npm specifier, with no `components/` prefix", () => {
    renderAtSlug("use-debounce");

    // The hook package publishes at the bare file name; a `components/` segment
    // here would mean the two sources had been given the same subpath prefix.
    expect(
      screen.getByText(
        'import { useDebounce } from "@fe-monorepo/hook/use-debounce";',
      ),
    ).toBeInTheDocument();
  });

  it("404s in place for a slug no hook has", () => {
    renderAtSlug("use-not-a-hook");

    expect(
      screen.getByRole("heading", { level: 1, name: "Không tìm thấy" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/use-not-a-hook/)).toBeInTheDocument();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });
});
