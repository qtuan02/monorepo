import { render, screen } from "@testing-library/react";
import { createRoutesStub, RouterContextProvider } from "react-router";
import { describe, expect, it, vi } from "vitest";

import { requireSession } from "~/features/auth/middleware/require-session";
import { userContext } from "~/features/auth/middleware/user-context";
import ProtectedRoute, { loader, middleware } from "~/routes/protected";

// The route module reaches `~/libs/session.server` through its middleware, and
// that module reads the `server` half of `~/env` at load — which jsdom's copy
// throws on by name. The guard itself is covered on the node environment in
// `test/features/auth/middleware/`; here the storage is out of the picture.
vi.mock("~/libs/session.server", () => ({
  getSessionUser: vi.fn(),
}));

const user = { id: "u-1", name: "Nguyễn Văn A" };

function GuardedChild() {
  return <p>guarded child</p>;
}

/**
 * `createRoutesStub` takes no `middleware`, so what it can prove is the half
 * AFTER the guard: given a context the guard already wrote to, the loader
 * reads the user out of it and the route renders whatever is nested under it.
 * That is the documented limit of the stub, and this file stays inside it —
 * the guard's own behaviour is `require-session.test.ts`.
 */
describe("route: protected", () => {
  it("mounts the session guard, and nothing else, as its middleware", () => {
    expect(middleware).toEqual([requireSession]);
  });

  it("renders the guarded child once the guard has put a user in context", async () => {
    const context = new RouterContextProvider();
    context.set(userContext, user);

    const Stub = createRoutesStub(
      [
        {
          path: "/",
          Component: ProtectedRoute,
          loader,
          // The loader runs before the first render, so the stub asks for a
          // fallback to show meanwhile — the same one the framework would.
          HydrateFallback: () => null,
          children: [{ path: "dashboard", Component: GuardedChild }],
        },
      ],
      context,
    );

    render(<Stub initialEntries={["/dashboard"]} />);

    expect(await screen.findByText("guarded child")).toBeInTheDocument();
  });

  it("puts the guard's user into the hydration payload", () => {
    const context = new RouterContextProvider();
    context.set(userContext, user);

    expect(
      loader({
        context,
        request: new Request("http://localhost/dashboard"),
        url: new URL("http://localhost/dashboard"),
        params: {},
        pattern: "/dashboard",
      }),
    ).toEqual({ user });
  });

  it("throws when mounted where the guard never ran", () => {
    // A route reaching this loader with an empty context is a route mounted
    // outside the pathless layout by mistake — that has to fail on the first
    // request, not render a page for an unchecked visitor.
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
