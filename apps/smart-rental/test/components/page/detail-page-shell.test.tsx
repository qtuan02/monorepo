import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import { describe, expect, it } from "vitest";

import { DetailPageShell } from "~/components/page/detail-page-shell";

function renderShell(
  props: Parameters<typeof DetailPageShell>[0],
  initialPath = "/",
) {
  const router = createMemoryRouter(
    [{ path: "*", element: <DetailPageShell {...props} /> }],
    { initialEntries: [initialPath] },
  );
  render(<RouterProvider router={router} />);
  return router;
}

describe("DetailPageShell", () => {
  it("keeps the plain back-button + actions + children layout when no tabs are given", () => {
    renderShell({
      title: "Chi tiết phòng",
      backTo: "/rooms",
      actions: <button type="button">Xóa</button>,
      children: <p>Nội dung phòng</p>,
    });

    expect(
      screen.getByRole("heading", { level: 1, name: "Chi tiết phòng" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Quay lại/ }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Xóa" })).toBeInTheDocument();
    expect(screen.getByText("Nội dung phòng")).toBeInTheDocument();
    expect(screen.queryByRole("tab")).not.toBeInTheDocument();
  });

  it("shows the header-entity row (name, badge, at most three meta) once `name` is passed", () => {
    renderShell({
      title: "Chi tiết toà nhà",
      name: "Trọ Sinh Viên Xanh",
      badge: <span>Đang hoạt động</span>,
      meta: ["123 Ngũ Hành Sơn", "2 tầng", "Ngày thu 5", "một mục thừa"],
      tabs: [
        { value: "overview", label: "Tổng quan", content: <p>Overview</p> },
      ],
    });

    expect(
      screen.getByRole("heading", { level: 2, name: "Trọ Sinh Viên Xanh" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Đang hoạt động")).toBeInTheDocument();
    expect(screen.getByText("123 Ngũ Hành Sơn")).toBeInTheDocument();
    expect(screen.getByText("2 tầng")).toBeInTheDocument();
    expect(screen.getByText("Ngày thu 5")).toBeInTheDocument();
    // At most three meta facts — a fourth is dropped, not silently overflowed.
    expect(screen.queryByText("một mục thừa")).not.toBeInTheDocument();
  });

  const tabsProps = {
    title: "Chi tiết toà nhà",
    name: "Trọ Sinh Viên Xanh",
    tabs: [
      {
        value: "overview",
        label: "Tổng quan",
        content: <p>Nội dung tổng quan</p>,
      },
      { value: "rooms", label: "Phòng", content: <p>Nội dung phòng</p> },
    ],
    sidebar: <p>Tỷ lệ lấp đầy</p>,
  };

  it("renders real tabs with panels, switches on click, writes the tab to the URL, and keeps the sidebar visible across tabs", async () => {
    const user = userEvent.setup();
    const router = renderShell(tabsProps);

    expect(screen.getByText("Nội dung tổng quan")).toBeVisible();
    expect(screen.getByText("Tỷ lệ lấp đầy")).toBeInTheDocument();
    // The default tab is not on the URL — a plain link to the screen still works.
    expect(router.state.location.search).toBe("");

    await user.click(screen.getByRole("tab", { name: "Phòng" }));
    expect(screen.getByText("Nội dung phòng")).toBeVisible();
    expect(router.state.location.search).toBe("?tab=rooms");
    // The sidebar is not tab content — it survives the switch untouched.
    expect(screen.getByText("Tỷ lệ lấp đầy")).toBeInTheDocument();
  });

  it("opens the tab named by `?tab=` on a deep link", () => {
    renderShell(tabsProps, "/?tab=rooms");

    expect(screen.getByText("Nội dung phòng")).toBeVisible();
    expect(screen.queryByText("Nội dung tổng quan")).not.toBeInTheDocument();
  });

  it("hides the right column when neither a qualifying actionsCard nor a sidebar is given", () => {
    renderShell({
      title: "Chi tiết hoá đơn",
      name: "HÓA-001",
      tabs: [
        { value: "overview", label: "Tổng quan", content: <p>Nội dung</p> },
      ],
    });

    expect(screen.queryByText("Hành động")).not.toBeInTheDocument();
  });

  it("does not render the Hành động card for a single action — it belongs in the header instead", () => {
    renderShell({
      title: "Chi tiết hoá đơn",
      name: "HÓA-001",
      tabs: [
        { value: "overview", label: "Tổng quan", content: <p>Nội dung</p> },
      ],
      actionsCard: [
        <button key="qr" type="button">
          Thanh toán VietQR
        </button>,
      ],
    });

    expect(screen.queryByText("Hành động")).not.toBeInTheDocument();
    // The right column is entirely gone too — no empty shell left behind.
    expect(
      screen.queryByRole("button", { name: "Thanh toán VietQR" }),
    ).not.toBeInTheDocument();
  });

  it("renders the Hành động card once there are at least two actions", () => {
    renderShell({
      title: "Chi tiết hoá đơn",
      name: "HÓA-001",
      tabs: [
        { value: "overview", label: "Tổng quan", content: <p>Nội dung</p> },
      ],
      actionsCard: [
        <button key="record" type="button">
          Ghi nhận thu
        </button>,
        <button key="qr" type="button">
          Thanh toán VietQR
        </button>,
      ],
    });

    expect(screen.getByText("Hành động")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Ghi nhận thu" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Thanh toán VietQR" }),
    ).toBeInTheDocument();
  });

  it("shows a breadcrumb trail instead of the back button when one is passed", () => {
    renderShell({
      title: "Gia hạn hợp đồng",
      breadcrumb: [
        { label: "Hợp đồng", to: "/contracts" },
        { label: "HĐ-001", to: "/contracts/C001" },
        { label: "Gia hạn" },
      ],
      children: <p>Form gia hạn</p>,
    });

    expect(screen.getByRole("link", { name: "Hợp đồng" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "HĐ-001" })).toBeInTheDocument();
    expect(screen.getByText("Gia hạn")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /Quay lại/ }),
    ).not.toBeInTheDocument();
  });
});
