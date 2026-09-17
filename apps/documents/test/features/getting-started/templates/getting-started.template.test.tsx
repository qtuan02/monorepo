import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it, vi } from "vitest";

import { ROUTES } from "~/constants/routes";
import GettingStartedTemplate from "~/features/getting-started/templates/getting-started.template";

/**
 * Two entries per catalogue rather than the generated sixty-three and five: the
 * cards must read their count from the catalogue, and only a number that is
 * not the real one proves they do rather than carry a literal.
 */
vi.mock("~/constants/docs-catalogue", () => {
  const entry = (slug: string, subpath: string) => ({
    slug,
    subpath,
    importPath: `@fe-monorepo/x/${subpath}`,
    exports: [slug],
    description: null,
  });

  return {
    componentCatalogue: {
      package: "@fe-monorepo/ui",
      generatedFrom: "packages/ui/src/components",
      items: [
        { ...entry("alert", "components/alert"), storybookDocsId: "alert" },
        { ...entry("button", "components/button"), storybookDocsId: "button" },
      ],
    },
    hookCatalogue: {
      package: "@fe-monorepo/hook",
      generatedFrom: "packages/hook/src",
      items: [
        entry("use-debounce", "use-debounce"),
        entry("use-is-mobile", "use-is-mobile"),
      ],
    },
  };
});

function renderTemplate() {
  return render(
    <MemoryRouter>
      <GettingStartedTemplate />
    </MemoryRouter>,
  );
}

describe("the getting-started page", () => {
  it("has one h1, the headline — `Bắt đầu` is the nav label, not the page's heading", () => {
    renderTemplate();

    const headings = screen.getAllByRole("heading", { level: 1 });
    expect(headings).toHaveLength(1);
    expect(headings[0]).toHaveAccessibleName(
      "Primitive Base UI, mỗi import một file.",
    );
  });

  it("counts the two catalogues on the cards and links each to its list", () => {
    renderTemplate();

    const components = screen.getByRole("link", { name: /^Component 2/ });
    const hooks = screen.getByRole("link", { name: /^Hook 2/ });

    expect(components).toHaveAttribute("href", ROUTES.COMPONENTS);
    expect(hooks).toHaveAttribute("href", ROUTES.HOOKS);

    // The lead reads the same two numbers, so it cannot carry a literal.
    expect(screen.getByText(/2 primitive và 2 hook/)).toBeInTheDocument();
  });

  it("opens Storybook in a new tab from the third card, with the opener cut", () => {
    renderTemplate();

    const storybook = screen.getByRole("link", { name: /Mở Storybook/ });

    expect(storybook).toHaveAttribute("target", "_blank");
    expect(storybook).toHaveAttribute("rel", "noopener noreferrer");
    expect(storybook.getAttribute("href")).toMatch(/^https?:\/\//);
  });

  it("numbers the six panels 01 / 06 through 06 / 06", () => {
    renderTemplate();

    for (let index = 1; index <= 6; index += 1) {
      expect(screen.getByText(`0${index} / 06`)).toBeInTheDocument();
    }
    expect(screen.queryByText("07 / 06")).not.toBeInTheDocument();
  });

  it("tells the reader the stylesheet import carries its own @source", () => {
    renderTemplate();

    const alert = screen.getByRole("alert");

    expect(
      within(alert).getByText("Dòng import globals.css không phải tuỳ chọn"),
    ).toBeInTheDocument();
    expect(within(alert).getByText(/@source "\.\/"/)).toBeInTheDocument();
    // The consumer is never told to aim an @source at node_modules by hand.
    expect(
      screen.queryByText(/node_modules\/@fe-monorepo/),
    ).not.toBeInTheDocument();
  });

  it("shows the theme override and the hook example as their own panels", () => {
    renderTemplate();

    expect(
      screen.getByRole("heading", { name: "Theme của riêng bạn" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/--color-brand: var\(--brand\)/),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Dùng hook" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/@fe-monorepo\/hook\/use-debounce/),
    ).toBeInTheDocument();
  });

  it("installs one package per guide, with a package-manager tab strip in each", () => {
    renderTemplate();

    const ui = screen.getByRole("region", { name: "@fe-monorepo/ui" });
    const hook = screen.getByRole("region", { name: "@fe-monorepo/hook" });

    expect(
      within(ui).getByText(/^bun add @fe-monorepo\/ui$/),
    ).toBeInTheDocument();
    expect(
      within(hook).getByText(/^bun add @fe-monorepo\/hook$/),
    ).toBeInTheDocument();
    // Never the old one-line install of both — the guides are apart.
    expect(
      screen.queryByText(/@fe-monorepo\/ui @fe-monorepo\/hook/),
    ).toBeNull();
    expect(screen.getAllByRole("tab", { name: "yarn" })).toHaveLength(2);
  });
});
