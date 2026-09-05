import type { LoaderFunction } from "react-router";
import { render, screen } from "@testing-library/react";
import { createRoutesStub } from "react-router";
import { describe, expect, it } from "vitest";

import i18n from "~/libs/i18n";
import ModuleRoute, { ErrorBoundary, loader, meta } from "~/routes/module";

type LoaderArgs = Parameters<typeof loader>[0];
type MetaArgs = Parameters<typeof meta>[0];

/**
 * The stub types a route's `loader` over the loose `Params<string>` (every key
 * optional), while typegen knows `slug` is present because the route path says
 * so. The typed loader is right and the stub is the one being generous, so the
 * adapter narrows at the boundary rather than loosening the module.
 */
const stubLoader: LoaderFunction = (args) => loader(args as LoaderArgs);

function loadSlug(slug: string) {
  // Only `params` is read; the rest of the args exist for a loader that reads
  // the request or the context, which this one deliberately does not.
  return loader({ params: { slug } } as unknown as LoaderArgs);
}

describe("route: module loader", () => {
  it("resolves a known slug to its catalogue entry", () => {
    expect(loadSlug("dashboard")).toEqual({ module: { id: "dashboard" } });
  });

  it("throws a 404 data response for a slug the catalogue does not know", () => {
    let thrown: unknown;
    try {
      loadSlug("khong-co");
    } catch (error) {
      thrown = error;
    }

    // A thrown `data()` — not a returned one, and not an `Error`: the status
    // it carries is what the server runtime writes on the document, and the
    // throw is what skips the component for the route's `ErrorBoundary`.
    expect(thrown).toMatchObject({ init: { status: 404 } });
  });
});

describe("route: module", () => {
  it("renders its slice template for a known slug", async () => {
    const Stub = createRoutesStub([
      {
        path: "/modules/:slug",
        Component: ModuleRoute,
        loader: stubLoader,
        ErrorBoundary,
      },
    ]);

    render(<Stub initialEntries={["/modules/dashboard"]} />);

    expect(
      await screen.findByRole("heading", { level: 1, name: "Bảng điều khiển" }),
    ).toBeInTheDocument();
  });

  it("renders the localized 404 through its own boundary for an unknown slug", async () => {
    const Stub = createRoutesStub([
      {
        path: "/modules/:slug",
        Component: ModuleRoute,
        loader: stubLoader,
        ErrorBoundary,
      },
    ]);

    render(<Stub initialEntries={["/modules/khong-co"]} />);

    // The route's boundary, not root's: caught here the shell stays around the
    // 404, which is the reason the route exports one at all.
    expect(
      await screen.findByRole("heading", {
        level: 1,
        name: "404 Không tìm thấy",
      }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Về trang chủ" })).toHaveAttribute(
      "href",
      "/",
    );
  });
});

function descriptorsFor(
  loaderData: { module: { id: "dashboard" } } | undefined,
  language = "vi",
) {
  return meta({
    loaderData,
    matches: [{ loaderData: { language } }],
  } as unknown as MetaArgs);
}

describe("route: module meta", () => {
  it("names the tab after the module, in the request's language", () => {
    expect(descriptorsFor({ module: { id: "dashboard" } })).toContainEqual({
      title: "Bảng điều khiển",
    });
    expect(
      descriptorsFor({ module: { id: "dashboard" } }, "en"),
    ).toContainEqual({ title: "Dashboard" });
  });

  it("carries the module's description for the crawler", () => {
    expect(descriptorsFor({ module: { id: "dashboard" } })).toContainEqual({
      name: "description",
      content: "Quản lý bệnh nhân, lịch hẹn, theo dõi dấu hiệu sinh tồn",
    });
  });

  it("names the tab 404 when the loader threw", () => {
    // `loaderData` is typed as present, and is `undefined` on the error render:
    // the loader threw, so nothing was returned. `meta` still runs then.
    expect(descriptorsFor(undefined)).toEqual([
      { title: "404 Không tìm thấy" },
    ]);
    expect(descriptorsFor(undefined, "en")).toEqual([
      { title: "404 Not Found" },
    ]);
  });

  it("leaves the singleton's own language where it was", () => {
    descriptorsFor({ module: { id: "dashboard" } }, "en");

    expect(i18n.resolvedLanguage).toBe("vi");
  });
});
