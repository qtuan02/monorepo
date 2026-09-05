import { render, screen } from "@testing-library/react";
import { createRoutesStub } from "react-router";
import { describe, expect, it } from "vitest";

import { HOME_CATALOGUE } from "~/features/home/constants/home-catalogue";
import i18n from "~/libs/i18n";
import HomeRoute, { loader, meta } from "~/routes/home";

/**
 * The wiring proof for this Runtime's test setup, and the reason
 * `vite.config.ts` swaps `reactRouter()` out when `VITEST` is set: the
 * framework plugin renders a route module into a whole HTML document and throws
 * "can't detect preamble" when there is none, which is exactly what
 * `createRoutesStub` gives it.
 *
 * So this asserts what only a route tree can: that the module's `loader` output
 * reaches its component as `loaderData`, and that the component hands it to the
 * slice's template. `env` is the client half here (jsdom), which is why the
 * loader reads a `PUBLIC_*` key and not the session secret.
 */
describe("route: home", () => {
  it("renders its slice template from the loader's data", async () => {
    // Bound once rather than re-called inside the assertion below: the moment
    // the auth ticket lets a loader read the request, a second bare call breaks
    // for a reason that has nothing to do with what is being asserted.
    const { appEnv } = loader();
    const Stub = createRoutesStub([
      { path: "/", Component: HomeRoute, loader },
    ]);

    render(<Stub initialEntries={["/"]} />);

    expect(
      await screen.findByRole("heading", {
        level: 1,
        name: "Template React Router",
      }),
    ).toBeInTheDocument();
    // The loader's own value, and not a pinned string: it comes from the
    // repo-root `.env` through Vite's `envDir`, so the assertion is that the
    // template renders what the loader returned. A component that ignored
    // `loaderData` would still pass the heading assertion above.
    expect(screen.getByText(appEnv)).toBeInTheDocument();
  });

  it("renders every catalogue entry as a card linking to its module page", async () => {
    const Stub = createRoutesStub([
      { path: "/", Component: HomeRoute, loader },
    ]);

    render(<Stub initialEntries={["/"]} />);

    // One card per catalogue entry, each a real link — this is the markup a
    // crawler reads in the first HTML, so it has to come from the loader and
    // not from anything fetched after paint.
    expect(
      await screen.findByRole("link", { name: /Bảng điều khiển/ }),
    ).toHaveAttribute("href", "/modules/dashboard");
    const cards = screen.getAllByRole("link", { name: /./ });
    const moduleLinks = cards.filter((card) =>
      card.getAttribute("href")?.startsWith("/modules/"),
    );
    expect(moduleLinks).toHaveLength(HOME_CATALOGUE.length);
  });
});

/**
 * `meta` is the half of the route module that runs OUTSIDE the React tree, so
 * it cannot reach the request's i18next instance through a provider. It reads
 * the language root's loader put in `matches[0].loaderData` and translates with
 * `getFixedT`, which is the one i18next call that is safe on a shared server
 * singleton — it fixes a language for the returned `t` without moving the
 * instance's own.
 */
function descriptorsFor(language: string) {
  return meta({
    loaderData: { appEnv: "local", modules: HOME_CATALOGUE },
    matches: [{ loaderData: { language } }],
  } as unknown as Parameters<typeof meta>[0]);
}

function titleFor(language: string) {
  return descriptorsFor(language).find((descriptor) => "title" in descriptor);
}

describe("route: home meta", () => {
  it("names the tab in the language of the request", () => {
    expect(titleFor("vi")).toEqual({
      title: "Template React Router — Monorepo (local)",
    });
    expect(titleFor("en")).toEqual({
      title: "React Router Template — Monorepo (local)",
    });
  });

  it("lists the catalogue's module titles as keywords, from the same loader data", () => {
    // Built from `loaderData`, not from a second read of the catalogue: the
    // keywords and the cards on the page cannot name different modules.
    expect(descriptorsFor("vi")).toContainEqual({
      name: "keywords",
      content: expect.stringContaining("Bảng điều khiển, Hệ thống POS"),
    });
    expect(descriptorsFor("en")).toContainEqual({
      name: "keywords",
      content: expect.stringContaining("Dashboard, POS System"),
    });
  });

  it("leaves the singleton's own language where it was", () => {
    titleFor("en");

    // The failure this guards against is silent and cross-request: a `meta`
    // that switched the singleton would translate its own title correctly and
    // hand every render still in flight the wrong language.
    expect(i18n.resolvedLanguage).toBe("vi");
  });
});
