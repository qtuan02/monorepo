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

  it("numbers the four panels 01 / 04 through 04 / 04", () => {
    renderTemplate();

    for (const kicker of ["01 / 04", "02 / 04", "03 / 04", "04 / 04"]) {
      expect(screen.getByText(kicker)).toBeInTheDocument();
    }
    expect(screen.queryByText("05 / 04")).not.toBeInTheDocument();
  });

  it("warns about the missing @source line on a titled alert", () => {
    renderTemplate();

    const alert = screen.getByRole("alert");

    expect(within(alert).getByText("Thiếu dòng @source")).toBeInTheDocument();
    expect(
      within(alert).getByText(/không quét node_modules/),
    ).toBeInTheDocument();
  });

  it("shows the install command for the active package manager and switches on a tab", () => {
    renderTemplate();

    expect(
      screen.getByText(/^bun add @fe-monorepo\/ui @fe-monorepo\/hook$/),
    ).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "npm" })).toBeInTheDocument();
  });
});
