import { expect, test } from "@playwright/test";

import { ROUTES } from "../src/constants/routes";
import { signIn } from "./support/auth-session";

// The Portal shell around every guarded screen: what only a real browser can
// prove — a choice surviving a real reload, the sidebar sheet on a phone-wide
// viewport, and sign-out landing on the sign-in screen.
test.describe("shell", () => {
  test.beforeEach(async ({ page }) => {
    await signIn(page);
    await page.goto(ROUTES.HOME);
  });

  test("keeps the Building scope across a reload, and `null` is every Toà nhà", async ({
    page,
  }) => {
    const allTab = page.getByRole("button", { name: "Tất cả Toà nhà" });
    const b1Tab = page.getByRole("button", { name: "Trọ Sinh Viên Xanh" });
    await expect(allTab).toHaveAttribute("aria-pressed", "true");

    await b1Tab.click();
    await expect(b1Tab).toHaveAttribute("aria-pressed", "true");

    await page.reload();
    await expect(b1Tab).toHaveAttribute("aria-pressed", "true");

    await allTab.click();
    await page.reload();
    await expect(allTab).toHaveAttribute("aria-pressed", "true");
  });

  test("navigates through the sidebar and marks the open area", async ({
    page,
  }) => {
    await page.getByRole("link", { name: "Hợp đồng", exact: true }).click();

    await expect(page).toHaveURL(new RegExp(`${ROUTES.CONTRACTS}$`));
    await expect(
      page.getByRole("heading", { name: "Quản lý hợp đồng" }),
    ).toBeVisible();
    // `exact`: the list screen itself carries a "Thêm hợp đồng" link (#137),
    // which the substring match would also resolve.
    await expect(
      page.getByRole("link", { name: "Hợp đồng", exact: true }),
    ).toHaveAttribute("data-active");
  });

  test("swaps the sidebar for a bottom nav on a phone (ADR-0011, spec #153 §10 row 22)", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });

    await expect(
      page.getByRole("link", { name: "Hợp đồng", exact: true }),
    ).toBeHidden();
    const bottomNav = page.getByRole("navigation", {
      name: "Điều hướng chính",
    });
    await expect(bottomNav).toBeVisible();
    await expect(
      bottomNav.getByRole("link", { name: "Hôm nay" }),
    ).toBeVisible();

    // Header does not overflow: the scope row stays reachable and scrollable.
    await expect(
      page.getByRole("button", { name: "Tất cả Toà nhà" }),
    ).toBeVisible();

    // "Thêm" opens the other sidebar areas, "Hợp đồng" among them.
    await bottomNav.getByRole("button", { name: "Thêm" }).click();
    await page
      .getByRole("dialog")
      .getByRole("link", { name: "Hợp đồng", exact: true })
      .click();

    await expect(page).toHaveURL(new RegExp(`${ROUTES.CONTRACTS}$`));
  });

  test("opens «Thu tiền» from the bottom nav to the còn phải thu Hoá đơn list", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const bottomNav = page.getByRole("navigation", {
      name: "Điều hướng chính",
    });

    await bottomNav.getByRole("link", { name: "Thu tiền" }).click();

    await expect(page).toHaveURL(/status=UNPAID,PARTIAL,OVERDUE&sort=dueDate/);
    await expect(
      page.getByRole("heading", { level: 1, name: "Hoá đơn" }),
    ).toBeVisible();
  });

  test("signs out from the mobile «Thêm» sheet's own account row", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const bottomNav = page.getByRole("navigation", {
      name: "Điều hướng chính",
    });

    await bottomNav.getByRole("button", { name: "Thêm" }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.getByRole("button", { name: "Đăng xuất" }).click();

    await expect(page).toHaveURL(new RegExp(`${ROUTES.AUTH_LOGIN}$`));
    await expect(
      page.getByRole("heading", { name: "Đăng nhập" }),
    ).toBeVisible();
  });

  test("hides the bottom nav from `md` up", async ({ page }) => {
    await expect(
      page.getByRole("navigation", { name: "Điều hướng chính" }),
    ).toBeHidden();
  });

  test("signs out from the nav-user menu", async ({ page }) => {
    // `exact` — the desktop header carries its own account menu too
    // ("Menu tài khoản"), visible at the same width as this sidebar one.
    await page.getByRole("button", { name: "Tài khoản", exact: true }).click();
    await page.getByRole("menuitem", { name: "Đăng xuất" }).click();

    await expect(page).toHaveURL(new RegExp(`${ROUTES.AUTH_LOGIN}$`));
    await expect(
      page.getByRole("heading", { name: "Đăng nhập" }),
    ).toBeVisible();
  });
});
