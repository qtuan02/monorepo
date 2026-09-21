import type { Page } from "@playwright/test";
import { expect, test } from "@playwright/test";

import { ROUTES } from "../src/constants/routes";
import { mockHealthCheck, mockSessionRefresh } from "./support/auth-session";

/**
 * The Islands shell (CONTEXT.md, ADR-0016) — the Rail/Bottom nav split is
 * a real viewport switch, which a jsdom test can only fake with a stubbed
 * `matchMedia`. This is the one place both are exercised for real.
 */
async function mockCurrentUser(page: Page) {
  await page.route("**/api/v1/user/me", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        data: {
          id: "u1",
          username: "tuanhq02",
          firstName: "Tuan",
          lastName: "Huynh",
        },
        message: null,
        status: 200,
      }),
    }),
  );
}

async function mockConversations(page: Page) {
  await page.route("**/api/v1/conversation*", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        data: {
          items: [
            {
              id: "c1",
              type: "DIRECT",
              groupName: null,
              lastMessage: null,
              lastMessageAt: null,
              unreadCount: 1,
              participants: [
                {
                  userId: "u1",
                  username: "tuanhq02",
                  firstName: "Tuan",
                  lastName: "Huynh",
                  role: "MEMBER",
                },
                {
                  userId: "u2",
                  username: "lannguyen",
                  firstName: "Lan",
                  lastName: "Nguyen",
                  role: "MEMBER",
                },
              ],
            },
          ],
          nextCursor: null,
        },
        message: null,
        status: 200,
      }),
    }),
  );
}

test.beforeEach(async ({ page }) => {
  await mockHealthCheck(page);
  await mockSessionRefresh(page, "e2e-token");
  await mockCurrentUser(page);
  await mockConversations(page);
});

test("shows the Rail on a desktop viewport, no Bottom nav", async ({
  page,
}) => {
  await page.goto(ROUTES.HOME);

  const nav = page.getByRole("navigation", { name: "Primary" });
  await expect(nav).toBeVisible();
  // "Profile" is the Rail's own third item — the Bottom nav has "Me" instead.
  await expect(nav.getByRole("link", { name: /Profile/ })).toBeVisible();
  await expect(nav.getByRole("link", { name: /Me/ })).not.toBeAttached();
});

test("shows the Bottom nav on a phone viewport, hides it inside a conversation, and back returns it", async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 700 });
  await page.goto(ROUTES.HOME);

  const nav = page.getByRole("navigation", { name: "Primary" });
  await expect(nav).toBeVisible();
  await expect(nav.getByRole("link")).toHaveCount(3);
  await expect(nav.getByRole("link", { name: /Me/ })).toBeVisible();

  // Reaching the conversation screen by URL, not by clicking a list row: the
  // list itself is Virtuoso-virtualized (ticket #234's own scope), and what
  // this spec is proving is the shell's nav, not that list's rendering.
  await page.goto(ROUTES.conversationByIdPath("c1"));
  await expect(page.getByRole("heading", { name: "Lan Nguyen" })).toBeVisible();
  await expect(nav).toBeHidden();

  await page.goBack();
  await expect(page).toHaveURL(new RegExp(`${ROUTES.HOME}$`));
  await expect(nav).toBeVisible();
});
