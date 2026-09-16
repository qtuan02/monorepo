import type { ReactNode } from "react";
import { screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import NavbarTemplate from "~/features/layout/templates/navbar.template";
import { render } from "../../../support/render";

/**
 * next-intl's `Link` reads the App Router context, which only exists inside a
 * running Next server. A plain anchor keeps the assertions about what the dock
 * decides — which items leave the site — instead of about Next's router.
 */
vi.mock("~/i18n/navigation", () => ({
  Link: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children: ReactNode;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

// `next-themes` is the one external system in the dock; the button's own
// decisions are covered in `components/theme-toggle-button.test.tsx`.
vi.mock("next-themes", () => ({
  useTheme: () => ({ resolvedTheme: "light", setTheme: vi.fn() }),
}));

/**
 * The redesign redraws the dock and takes its magnification out; what it must
 * not change is the bar's contents. Four controls, in this order, each with the
 * accessible name the catalogue gives it — the tooltip text is the same string,
 * so a reader with a pointer and a reader with a screen reader hear the same
 * thing.
 */
describe("NavbarTemplate", () => {
  it("keeps the four items in order, with their catalogue names", () => {
    render(<NavbarTemplate />);

    const dock = screen.getByRole("navigation");
    // Document order across two roles — three links and a button — is what the
    // assertion is about, and a role query returns one role at a time.
    const names = Array.from(dock.querySelectorAll("[aria-label]"), (node) =>
      node.getAttribute("aria-label"),
    );

    expect(names).toEqual([
      "Trang chủ",
      "LinkedIn",
      "GitHub",
      "Đổi giao diện sáng tối",
    ]);
  });

  it("opens the external links in a new tab and keeps home in the app", () => {
    render(<NavbarTemplate />);

    const dock = screen.getByRole("navigation");

    for (const name of ["LinkedIn", "GitHub"]) {
      const link = within(dock).getByRole("link", { name });

      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noreferrer");
    }

    expect(
      within(dock).getByRole("link", { name: "Trang chủ" }),
    ).not.toHaveAttribute("target");
  });
});
