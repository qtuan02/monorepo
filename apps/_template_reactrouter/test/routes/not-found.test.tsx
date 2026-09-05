import { render, screen } from "@testing-library/react";
import { createRoutesStub } from "react-router";
import { describe, expect, it } from "vitest";

import NotFoundRoute, { loader, meta } from "~/routes/not-found";

describe("route: not-found loader", () => {
  it("returns — not throws — a 404 data response", () => {
    // `return`: the component IS the 404 screen, so the loader's only job is to
    // put the status on the document. A throw would skip the component and
    // land in root's boundary, which replaces the shell.
    expect(loader()).toMatchObject({ init: { status: 404 } });
  });
});

describe("route: not-found", () => {
  it("renders the localized 404 screen for an unmatched path", async () => {
    const Stub = createRoutesStub([
      { path: "*", Component: NotFoundRoute, loader },
    ]);

    render(<Stub initialEntries={["/khong-ton-tai"]} />);

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

describe("route: not-found meta", () => {
  it("names the tab 404 in the request's language", () => {
    const titleFor = (language: string) =>
      meta({
        loaderData: null,
        matches: [{ loaderData: { language } }],
      } as unknown as Parameters<typeof meta>[0]);

    expect(titleFor("vi")).toEqual([{ title: "404 Không tìm thấy" }]);
    expect(titleFor("en")).toEqual([{ title: "404 Not Found" }]);
  });
});
