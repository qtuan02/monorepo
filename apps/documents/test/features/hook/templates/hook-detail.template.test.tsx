import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import { describe, expect, it, vi } from "vitest";

import { findHook, hookCatalogue } from "~/constants/docs-catalogue";
import { ROUTES } from "~/constants/routes";
import HookDetailTemplate from "~/features/hook/templates/hook-detail.template";

// The real lookup, wrapped so one test can hand the page an entry the
// catalogue invariant forbids — a hook with no `@example`.
vi.mock("~/constants/docs-catalogue", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("~/constants/docs-catalogue")>();
  return { ...actual, findHook: vi.fn(actual.findHook) };
});

function renderAtSlug(slug: string) {
  return render(
    <MemoryRouter initialEntries={[ROUTES.hookBySlugPath(slug)]}>
      <Routes>
        <Route path={ROUTES.HOOK_BY_SLUG} element={<HookDetailTemplate />} />
      </Routes>
    </MemoryRouter>,
  );
}

function entryAt(index: number) {
  const entry = hookCatalogue.items.at(index);
  if (!entry) throw new Error(`no catalogue entry at ${index}`);
  return entry;
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
      screen.getAllByRole("listitem").map((chip) => chip.textContent),
    ).toEqual(["useDebounce"]);

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

  it("embeds the hook's story from Storybook as the example, and links its docs page", () => {
    const entry = findHook("use-debounce");
    if (!entry) throw new Error("`use-debounce` is missing from the catalogue");

    renderAtSlug(entry.slug);

    expect(
      screen.getByRole("heading", { level: 2, name: "Ví dụ" }),
    ).toBeInTheDocument();
    // `Hooks/useDebounce` slugified — the story lives beside the primitives'.
    expect(
      screen.getByTitle("Ví dụ use-debounce trên Storybook"),
    ).toHaveAttribute(
      "src",
      expect.stringContaining("iframe.html?id=hooks-usedebounce--default"),
    );
    expect(screen.getByRole("link", { name: /Storybook/ })).toHaveAttribute(
      "href",
      expect.stringContaining("path=/docs/hooks-usedebounce--docs"),
    );
  });

  it("shows the hook's own `@example` as the usage panel", () => {
    renderAtSlug("use-debounce");

    expect(
      screen.getByRole("heading", { level: 2, name: "Cách dùng" }),
    ).toBeInTheDocument();
    // A line from `packages/hook/src/use-debounce.ts`'s JSDoc, not from any
    // catalogue or README — the source is the only place it is written.
    expect(
      screen.getByText(/const debouncedSearch = useDebounce\(search, 500\);/),
    ).toBeInTheDocument();
  });

  it("renders no usage panel for a hook whose JSDoc has no `@example`", () => {
    const entry = findHook("use-debounce");
    if (!entry) throw new Error("`use-debounce` is missing from the catalogue");
    vi.mocked(findHook).mockReturnValueOnce({ ...entry, example: null });

    renderAtSlug("use-debounce");

    expect(screen.queryByRole("heading", { name: "Cách dùng" })).toBeNull();
    // The rest of the page is unaffected: the import panel still renders.
    expect(
      screen.getByRole("heading", { level: 2, name: "Import" }),
    ).toBeInTheDocument();
  });

  it("links to both neighbours in catalogue order from an entry in the middle", () => {
    const [prev, entry, next] = [entryAt(0), entryAt(1), entryAt(2)];

    renderAtSlug(entry.slug);

    expect(
      screen.getByRole("link", { name: `Trước: ${prev.slug}` }),
    ).toHaveAttribute("href", ROUTES.hookBySlugPath(prev.slug));
    expect(
      screen.getByRole("link", { name: `Sau: ${next.slug}` }),
    ).toHaveAttribute("href", ROUTES.hookBySlugPath(next.slug));
  });

  it("has no previous link on the first hook and no next link on the last", () => {
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

  it("404s in place for a slug no hook has", () => {
    renderAtSlug("use-not-a-hook");

    expect(
      screen.getByRole("heading", { level: 1, name: "Không tìm thấy" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/use-not-a-hook/)).toBeInTheDocument();
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
  });
});
