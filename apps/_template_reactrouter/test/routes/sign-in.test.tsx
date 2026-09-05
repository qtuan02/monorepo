import { render, screen } from "@testing-library/react";
import { createRoutesStub } from "react-router";
import { describe, expect, it, vi } from "vitest";

import { TEMPLATE_USER } from "~/features/auth/constants/template-user";
import { guestOnly } from "~/features/auth/middleware/guest-only";
import SignInRoute, { action, loader, middleware } from "~/routes/sign-in";

// The action writes through `~/libs/session.server`, which reads the `server`
// half of `~/env` at load — a throw by name on jsdom. The mock keeps the
// SHAPE the action depends on: a real `Session` object to `set` the user on,
// and a `commitSession` that answers with a `Set-Cookie` line. Whether that
// line is signed correctly is `test/libs/session.server.test.ts`'s job, on the
// node environment.
const SET_COOKIE = "template_reactrouter_session=signed; Path=/; HttpOnly";

vi.mock("~/libs/session.server", async () => {
  const { createSession } = await import("react-router");

  return {
    getSession: vi.fn(async () => createSession()),
    commitSession: vi.fn(async () => SET_COOKIE),
  };
});

function loaderArgs(url: string) {
  return {
    request: new Request(url),
    url: new URL(url),
    params: {},
    pattern: "/sign-in",
    context: {} as never,
  };
}

function actionArgs(fields: Record<string, string>) {
  const body = new URLSearchParams(fields);

  return {
    request: new Request("http://localhost/sign-in", {
      method: "POST",
      body,
      headers: { "content-type": "application/x-www-form-urlencoded" },
    }),
    url: new URL("http://localhost/sign-in"),
    params: {},
    pattern: "/sign-in",
    context: {} as never,
  };
}

/** The redirect an action throws, as the caught `Response`. */
async function submit(fields: Record<string, string>) {
  const thrown = await action(actionArgs(fields)).then(
    () => null,
    (error: unknown) => error,
  );

  expect(thrown).toBeInstanceOf(Response);

  return thrown as Response;
}

const Stub = createRoutesStub([
  {
    path: "/sign-in",
    Component: SignInRoute,
    loader,
    HydrateFallback: () => null,
  },
]);

describe("route: sign-in", () => {
  it("keeps signed-in visitors out with the guest middleware, for GET and POST alike", () => {
    expect(middleware).toEqual([guestOnly]);
  });

  it("renders the form with the fields the action reads", async () => {
    render(<Stub initialEntries={["/sign-in"]} />);

    expect(
      await screen.findByRole("heading", { level: 1, name: "Đăng nhập" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Tài khoản")).toHaveAttribute(
      "name",
      "username",
    );
    expect(screen.getByLabelText("Mật khẩu")).toHaveAttribute(
      "name",
      "password",
    );
    expect(screen.getByRole("button", { name: "Đăng nhập" })).toHaveAttribute(
      "type",
      "submit",
    );
    // This screen is outside the shell, so it is the one place the header's
    // switcher cannot reach — it has to carry its own.
    expect(screen.getByRole("combobox")).toBeInTheDocument();
  });

  it("carries redirectTo from the URL into a hidden field, query string included", async () => {
    const { container } = render(
      <Stub initialEntries={["/sign-in?redirectTo=%2Fdashboard%3Ftab%3D1"]} />,
    );
    await screen.findByRole("heading", { level: 1 });

    // A hidden input has no role, so it is reached by its name — which is
    // also the contract: the action reads exactly this field.
    expect(container.querySelector('input[name="redirectTo"]')).toHaveAttribute(
      "value",
      "/dashboard?tab=1",
    );
  });

  it("renders no hidden field when the visitor came on their own", async () => {
    const { container } = render(<Stub initialEntries={["/sign-in"]} />);
    await screen.findByRole("heading", { level: 1 });

    expect(container.querySelector('input[name="redirectTo"]')).toBeNull();
  });

  it("narrows an off-origin redirectTo out of the loader data before it reaches the form", () => {
    // The loader is where the form's value is decided, so the open-redirect
    // guard has to hold here — the action's check is the second line.
    expect(
      loader(loaderArgs("http://localhost/sign-in?redirectTo=//evil.example")),
    ).toEqual({ redirectTo: undefined });
    expect(
      loader(loaderArgs("http://localhost/sign-in?redirectTo=%2Fdashboard")),
    ).toEqual({ redirectTo: "/dashboard" });
  });
});

describe("route: sign-in action", () => {
  it("mints the session and lands on the dashboard by default", async () => {
    const { getSession, commitSession } = await import("~/libs/session.server");
    const response = await submit({ username: "a", password: "b" });

    expect(response.status).toBe(302);
    expect(response.headers.get("location")).toBe("/dashboard");
    // The cookie the guard will check for rides on the redirect itself.
    expect(response.headers.get("set-cookie")).toBe(SET_COOKIE);
    // And what was committed is a session holding the Template's fixed user —
    // the placeholder for what a real credential check would return.
    const session = await vi.mocked(getSession).mock.results[0]?.value;
    expect(session.get("user")).toEqual(TEMPLATE_USER);
    expect(commitSession).toHaveBeenCalledWith(session);
  });

  it("honours a redirectTo on this origin", async () => {
    const response = await submit({ redirectTo: "/dashboard?tab=billing" });

    expect(response.headers.get("location")).toBe("/dashboard?tab=billing");
  });

  it("falls back to the dashboard for a redirectTo that leaves this origin", async () => {
    // The hidden field is still a form value anyone can edit, so the loader's
    // narrowing is not enough on its own.
    const response = await submit({ redirectTo: "https://evil.example/" });

    expect(response.headers.get("location")).toBe("/dashboard");
  });
});
