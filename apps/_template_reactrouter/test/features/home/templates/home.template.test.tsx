import { render, screen } from "@testing-library/react";
import { createRoutesStub } from "react-router";
import { describe, expect, it } from "vitest";

import type { HomeModule } from "~/features/home/types/home-module";
import HomeTemplate from "~/features/home/templates/home.template";

const modules: HomeModule[] = [
  { id: "dashboard" },
  { id: "pos", comingSoon: true },
];

/**
 * `Link` needs a router above it, and `createRoutesStub` is the one this
 * Runtime's tests already use — so the template is rendered as the component
 * of a single stub route rather than under a hand-built `MemoryRouter`.
 */
function renderTemplate() {
  const Stub = createRoutesStub([
    {
      path: "/",
      Component: () => <HomeTemplate appEnv="local" modules={modules} />,
    },
  ]);

  return render(<Stub initialEntries={["/"]} />);
}

describe("HomeTemplate", () => {
  it("heads the catalogue with the shared launcher title, below the page's own", () => {
    renderTemplate();

    // The Template's hero keeps the <h1>; the catalogue is a section of it.
    expect(
      screen.getByRole("heading", { level: 2, name: "Phân hệ" }),
    ).toBeInTheDocument();
  });

  it("links a built module to its public page", () => {
    renderTemplate();

    expect(
      screen.getByRole("link", { name: /Bảng điều khiển/ }),
    ).toHaveAttribute("href", "/modules/dashboard");
  });

  it("links an unbuilt module too — its page is where 'not built yet' is said", () => {
    renderTemplate();

    // The decision that differs from the Next Template, whose unbuilt card is
    // plain text: here every catalogue entry has a URL of its own, so the card
    // stays a link and the module page carries the notice.
    expect(screen.getByRole("link", { name: /Hệ thống POS/ })).toHaveAttribute(
      "href",
      "/modules/pos",
    );
    expect(
      screen.getByRole("heading", { level: 3, name: "Hệ thống POS" }),
    ).toBeInTheDocument();
  });
});
