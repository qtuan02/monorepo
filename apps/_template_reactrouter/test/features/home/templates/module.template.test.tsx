import { render, screen } from "@testing-library/react";
import { createRoutesStub } from "react-router";
import { describe, expect, it } from "vitest";

import type { HomeModule } from "~/features/home/types/home-module";
import ModuleTemplate from "~/features/home/templates/module.template";

function renderTemplate(module: HomeModule) {
  const Stub = createRoutesStub([
    { path: "/", Component: () => <ModuleTemplate module={module} /> },
  ]);

  return render(<Stub initialEntries={["/"]} />);
}

/**
 * The two branches a module page has: built, with a way into its screen; and
 * unbuilt, with the honest notice instead. Both keep the module's name as the
 * page heading — that is the `<title>`/`<h1>` a crawler indexes the URL by.
 */
describe("ModuleTemplate", () => {
  it("offers the way into a built module's screen", () => {
    renderTemplate({ id: "dashboard" });

    expect(
      screen.getByRole("heading", { level: 1, name: "Bảng điều khiển" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Mở Bảng điều khiển" }),
    ).toHaveAttribute("href", "/dashboard");
    expect(screen.queryByText("Đang phát triển")).not.toBeInTheDocument();
  });

  it("says an unbuilt module is not built yet, and offers no screen to open", () => {
    renderTemplate({ id: "pos", comingSoon: true });

    expect(
      screen.getByRole("heading", { level: 1, name: "Hệ thống POS" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Đang phát triển")).toBeInTheDocument();
    // No "open" link at all — a link to a screen that does not exist would be
    // the dead link this page exists to avoid.
    expect(
      screen.queryByRole("link", { name: /^Mở / }),
    ).not.toBeInTheDocument();
    // The way back is still there.
    expect(
      screen.getByRole("link", { name: "Về danh sách phân hệ" }),
    ).toHaveAttribute("href", "/");
  });
});
