import { render, screen } from "@testing-library/react";
import { createRoutesStub } from "react-router";
import { describe, expect, it } from "vitest";

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
});

/**
 * `meta` is the half of the route module that runs OUTSIDE the React tree, so
 * it cannot reach the request's i18next instance through a provider. It reads
 * the language root's loader put in `matches[0].loaderData` and translates with
 * `getFixedT`, which is the one i18next call that is safe on a shared server
 * singleton — it fixes a language for the returned `t` without moving the
 * instance's own.
 */
function titleFor(language: string) {
  const descriptors = meta({
    loaderData: { appEnv: "local" },
    matches: [{ loaderData: { language } }],
  } as unknown as Parameters<typeof meta>[0]);

  return descriptors.find((descriptor) => "title" in descriptor);
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

  it("leaves the singleton's own language where it was", () => {
    titleFor("en");

    // The failure this guards against is silent and cross-request: a `meta`
    // that switched the singleton would translate its own title correctly and
    // hand every render still in flight the wrong language.
    expect(i18n.resolvedLanguage).toBe("vi");
  });
});
