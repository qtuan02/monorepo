import { render, screen } from "@testing-library/react";
import { createRoutesStub } from "react-router";
import { describe, expect, it } from "vitest";

import NotFound from "~/components/exception/not-found";

describe("NotFound", () => {
  it("renders the 404 copy with a real link home", () => {
    // `Link` needs a router; a stub route is the smallest one this Runtime has.
    const Stub = createRoutesStub([{ path: "*", Component: NotFound }]);

    render(<Stub initialEntries={["/khong-ton-tai"]} />);

    expect(
      screen.getByRole("heading", { level: 1, name: "404 Không tìm thấy" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Trang bạn đang tìm không tồn tại hoặc đã được di chuyển.",
      ),
    ).toBeInTheDocument();
    // A link, not a button: the styled anchor keeps its link role, so it is
    // announced as navigation and works before hydration.
    const link = screen.getByRole("link", { name: "Về trang chủ" });
    expect(link).toHaveAttribute("href", "/");
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
