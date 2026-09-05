import { screen } from "@testing-library/react";
import { createRoutesStub, RouterContextProvider } from "react-router";
import { describe, expect, it, vi } from "vitest";

import { userContext } from "~/features/auth/middleware/user-context";
import i18n from "~/libs/i18n";
import DashboardRoute, { loader, meta } from "~/routes/dashboard";
import { render } from "../support/render";

/**
 * The screen's second data path reaches the network, and the seam for it is the
 * service singleton — the same one `test/features/dashboard/components/
 * template-list.test.tsx` mocks, where that half is actually asserted. Here it
 * only has to stay quiet: this file is about what the loader put on screen. A
 * promise that never settles leaves the list on its skeleton for the whole test.
 *
 * `render` is the shared one from `test/support`, because a stub renders the
 * route module alone — the `QueryClientProvider` that `root.tsx`'s `Layout`
 * supplies in the real app has to come from somewhere.
 */
vi.mock("~/libs/http-client", () => ({
  templateService: { getTemplates: vi.fn(() => new Promise(() => {})) },
}));

const user = { id: "u-1", name: "Nguyễn Văn A" };

function stubFor(context: RouterContextProvider) {
  return createRoutesStub(
    [
      {
        path: "/dashboard",
        Component: DashboardRoute,
        loader,
        HydrateFallback: () => null,
      },
    ],
    context,
  );
}

describe("route: dashboard", () => {
  it("shows the signed-in user from the guard's context, and a way out", async () => {
    const context = new RouterContextProvider();
    context.set(userContext, user);
    const Stub = stubFor(context);

    render(<Stub initialEntries={["/dashboard"]} />);

    // The name is session data — it came through the loader, not the
    // catalogue — so a template that ignored `loaderData` fails here.
    expect(
      await screen.findByRole("heading", { level: 2, name: user.name }),
    ).toBeInTheDocument();

    // Sign-out is a POST to the resource route, never a link: a link is a GET,
    // and a GET can be fired by a prefetch. The form is what makes it safe.
    const button = screen.getByRole("button", { name: "Đăng xuất" });
    const form = button.closest("form");

    expect(button).toHaveAttribute("type", "submit");
    expect(form).toHaveAttribute("method", "post");
    expect(form).toHaveAttribute("action", "/sign-out");
  });

  it("re-checks nothing: a loader outside the guard throws rather than rendering for nobody", () => {
    expect(() =>
      loader({
        context: new RouterContextProvider(),
        request: new Request("http://localhost/dashboard"),
        url: new URL("http://localhost/dashboard"),
        params: {},
        pattern: "/dashboard",
      }),
    ).toThrow();
  });
});

function metaFor(language: string) {
  return meta({
    loaderData: { user },
    matches: [{ loaderData: { language } }],
  } as unknown as Parameters<typeof meta>[0]);
}

describe("route: dashboard meta", () => {
  it("names the tab in the language of the request", () => {
    expect(metaFor("vi")).toContainEqual({
      title: "Bảng điều khiển — Monorepo",
    });
    expect(metaFor("en")).toContainEqual({ title: "Dashboard — Monorepo" });
    // And leaves the singleton where it was — the same cross-request trap
    // `test/routes/home.test.tsx` pins.
    expect(i18n.resolvedLanguage).toBe("vi");
  });

  it("asks crawlers not to index a page they can only ever be bounced from", () => {
    expect(metaFor("vi")).toContainEqual({
      name: "robots",
      content: "noindex",
    });
  });

  it("survives an error render, where root's loader data is missing", () => {
    // `matches[0].loaderData` is typed as present but is `undefined` when the
    // root `ErrorBoundary` renders — the title must still come out translated
    // rather than throwing inside `<Meta />`.
    const descriptors = meta({
      loaderData: { user },
      matches: [{ loaderData: undefined }],
    } as unknown as Parameters<typeof meta>[0]);

    expect(descriptors).toContainEqual({
      title: "Bảng điều khiển — Monorepo",
    });
  });
});
