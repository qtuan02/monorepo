import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router";
import { describe, expect, it } from "vitest";

import { ROUTES } from "~/constants/routes";
import LayoutTemplate from "~/features/layout/templates/layout.template";
import { ThemeProvider } from "~/libs/theme-provider";

function Probe() {
  return <h1>trang</h1>;
}

/** The shell around a page at `path`, with the route tree `main.tsx` mounts. */
function renderShellAt(path: string) {
  return render(
    <ThemeProvider>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path={ROUTES.HOME} element={<LayoutTemplate />}>
            <Route index element={<Probe />} />
            <Route path={ROUTES.COMPONENTS} element={<Probe />} />
            <Route path={ROUTES.COMPONENT_BY_SLUG} element={<Probe />} />
            <Route path={ROUTES.HOOKS} element={<Probe />} />
          </Route>
        </Routes>
      </MemoryRouter>
    </ThemeProvider>,
  );
}

describe("the shell", () => {
  it("reads skip link → nav → backdrop → main → footer, and the skip link targets main", () => {
    const { container } = renderShellAt(ROUTES.HOME);

    const skipLink = screen.getByRole("link", { name: "Bỏ qua tới nội dung" });
    const nav = screen.getByRole("navigation");
    const backdrop = container.querySelector("[data-intensity]");
    const main = screen.getByRole("main");
    const footer = screen.getByRole("contentinfo");
    if (!backdrop) throw new Error("no backdrop rendered");

    expect(skipLink).toHaveAttribute("href", `#${main.id}`);
    expect(backdrop).toHaveAttribute("aria-hidden", "true");

    const FOLLOWS = Node.DOCUMENT_POSITION_FOLLOWING;
    expect(skipLink.compareDocumentPosition(nav) & FOLLOWS).toBeTruthy();
    expect(nav.compareDocumentPosition(backdrop) & FOLLOWS).toBeTruthy();
    expect(backdrop.compareDocumentPosition(main) & FOLLOWS).toBeTruthy();
    expect(main.compareDocumentPosition(footer) & FOLLOWS).toBeTruthy();
  });

  it("marks the open section, including a detail page under it", () => {
    renderShellAt(ROUTES.componentBySlugPath("dialog"));

    const nav = screen.getByRole("navigation");
    expect(
      within(nav).getByRole("link", { name: "Component" }),
    ).toHaveAttribute("aria-current", "page");
    expect(
      within(nav).getByRole("link", { name: "Bắt đầu" }),
    ).not.toHaveAttribute("aria-current");
  });

  it.each([
    [ROUTES.HOME, "full"],
    [ROUTES.COMPONENTS, "soft"],
    [ROUTES.HOOKS, "soft"],
  ])("draws the backdrop at %s with intensity %s", (path, intensity) => {
    const { container } = renderShellAt(path);

    expect(container.querySelector("[data-intensity]")).toHaveAttribute(
      "data-intensity",
      intensity,
    );
  });

  it("opens the palette on Ctrl+K, filters both catalogues and navigates on pick", async () => {
    const user = userEvent.setup();
    renderShellAt(ROUTES.HOME);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    await user.keyboard("{Control>}k{/Control}");

    const dialog = await screen.findByRole("dialog");
    await user.type(
      within(dialog).getByPlaceholderText("Gõ tên component hoặc hook…"),
      "dialog",
    );

    // `dialog` and `alert-dialog` survive the filter; `button` does not.
    expect(within(dialog).getByText("alert-dialog")).toBeInTheDocument();
    expect(within(dialog).queryByText("button")).not.toBeInTheDocument();

    await user.click(within(dialog).getByText("dialog", { exact: true }));

    expect(
      within(screen.getByRole("navigation")).getByRole("link", {
        name: "Component",
      }),
    ).toHaveAttribute("aria-current", "page");
  });

  it("closes the palette again on a second Ctrl+K", async () => {
    const user = userEvent.setup();
    renderShellAt(ROUTES.HOME);

    await user.keyboard("{Control>}k{/Control}");
    expect(await screen.findByRole("dialog")).toBeInTheDocument();

    await user.keyboard("{Control>}k{/Control}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
