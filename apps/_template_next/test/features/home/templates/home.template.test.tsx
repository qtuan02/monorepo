import type { ReactNode } from "react";
import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { HomeModule } from "~/features/home/types/home-module";
import HomeTemplate from "~/features/home/templates/home.template";
import { render } from "../../../support/render";

/**
 * next-intl's `Link` reads the App Router context, which only exists inside a
 * running Next server — there is no `MemoryRouter` equivalent to wrap a test in.
 * Swapping it for a plain anchor keeps the assertions about what this template
 * decides (which cards link, which do not) instead of about Next's router.
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

const modules: HomeModule[] = [
  { id: "dashboard", href: "/dashboard" },
  { id: "pos", href: "/", comingSoon: true },
];

describe("HomeTemplate", () => {
  it("renders the launcher heading in the pinned locale", () => {
    render(<HomeTemplate modules={modules} />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Phân hệ" }),
    ).toBeInTheDocument();
  });

  it("links a built module to its route", () => {
    render(<HomeTemplate modules={modules} />);

    expect(
      screen.getByRole("link", { name: /Bảng điều khiển/ }),
    ).toHaveAttribute("href", "/dashboard");
  });

  it("shows an unbuilt module but does not link it", () => {
    render(<HomeTemplate modules={modules} />);

    // The title is still readable — a card the user can see but not open beats
    // a link that promises a screen and delivers a 404.
    expect(
      screen.getByRole("heading", { level: 2, name: "Hệ thống POS" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: /Hệ thống POS/ }),
    ).not.toBeInTheDocument();
  });
});
