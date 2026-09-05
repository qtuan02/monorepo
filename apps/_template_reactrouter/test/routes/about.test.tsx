import { render, screen } from "@testing-library/react";
import { createRoutesStub } from "react-router";
import { describe, expect, it } from "vitest";

import AboutRoute, { meta } from "~/routes/about";

describe("route: about", () => {
  it("renders its slice template with no loader at all", async () => {
    // No `loader` on the stub route either: the route is prerendered, and a
    // loader would run at build time rather than per visitor — so the screen
    // has to render from nothing but the catalogue.
    const Stub = createRoutesStub([{ path: "/about", Component: AboutRoute }]);

    render(<Stub initialEntries={["/about"]} />);

    expect(
      await screen.findByRole("heading", { level: 1, name: "Giới thiệu" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Về trang chủ" })).toHaveAttribute(
      "href",
      "/",
    );
  });
});

describe("route: about meta", () => {
  it("names the tab in the language root's loader recorded", () => {
    const titleFor = (language: string) =>
      meta({
        matches: [{ loaderData: { language } }],
      } as unknown as Parameters<typeof meta>[0]).find(
        (descriptor) => "title" in descriptor,
      );

    expect(titleFor("vi")).toEqual({ title: "Giới thiệu — Monorepo" });
    expect(titleFor("en")).toEqual({ title: "About — Monorepo" });
  });

  it("still names the tab when root's entry is undefined, as the type allows", () => {
    // Typegen types `matches[0].loaderData` as possibly `undefined`. The
    // framework never actually calls this `meta` on that render (it stops at
    // root's boundary), so this pins the fallback the type demands rather than
    // a path a visitor reaches — a `meta` that threw here would be a crash on
    // the day the framework's behaviour changed.
    const descriptors = meta({
      matches: [{ loaderData: undefined }],
    } as unknown as Parameters<typeof meta>[0]);

    expect(descriptors).toContainEqual({ title: "Giới thiệu — Monorepo" });
  });
});
