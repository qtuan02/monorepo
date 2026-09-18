import { expect, test } from "@playwright/test";

import { ROUTES } from "../src/constants/routes";
import { signIn } from "./support/auth-session";

// Thông báo: the flat (no nested tab) layout, a real-layout concern a
// component test can't prove on its own. Việc cần làm has no route of its
// own any more (spec #179 §"Hôm nay" decision 4 — /tasks 404s, see
// `dashboard.e2e.ts` for the gộp queue itself).
test.describe("Thông báo", () => {
  test.beforeEach(async ({ page }) => {
    await signIn(page);
  });

  test("Thông báo: one flat tab list, «Dùng mẫu» on every mẫu, no «Gửi ngay»", async ({
    page,
  }) => {
    await page.goto(ROUTES.COMMUNICATIONS);
    // `exact` — the "Mẫu thông báo" card heading below it also matches
    // "Thông báo" as a substring.
    await expect(
      page.getByRole("heading", { name: "Thông báo", exact: true }),
    ).toBeVisible();

    // No nested tabs — a channel filter, not a second Tabs list.
    await expect(page.getByRole("tab")).toHaveCount(2);
    await expect(page.getByRole("button", { name: "Gửi ngay" })).toHaveCount(0);
    await expect(
      page.getByRole("button", { name: "Dùng mẫu" }).first(),
    ).toBeVisible();

    await page.getByRole("tab", { name: "Nhật ký gửi tin" }).click();
    await expect(page.getByText("Tổng tin nhắn")).toBeVisible();
  });
});
