import { expect, test } from "@playwright/test";

/**
 * The chat screen on the **built** app.
 *
 * The model itself is out of scope here — a spec that talked to Gemini would
 * need a real key in CI and would be flaky by construction. What is in scope is
 * the boundary either side of it: the surface a visitor is handed, and the fact
 * that a turn which cannot reach a model ends as a readable error rather than a
 * spinner that never stops.
 *
 * That second assertion holds however the turn fails. CI builds with the
 * placeholder key from `.env.example`, so Google rejects it; on a machine with
 * no egress the same send fails to connect. Both are classified by
 * `~/features/chat/utils/chat-error-code.ts` and both must land in the same
 * alert — which is exactly the property worth pinning. Which *message* each
 * cause produces is pinned without a network in
 * `test/features/chat/utils/chat-error-code.test.ts`.
 */
test.describe("chat", () => {
  test("hands the visitor a composer, a send button and a model picker", async ({
    page,
  }) => {
    await page.goto("/");

    await expect(
      page.getByRole("heading", { level: 1, name: "Xin chào" }),
    ).toBeVisible();

    // By accessible name, because that is what a screen reader gets too.
    await expect(
      page.getByRole("textbox", { name: "Nội dung tin nhắn" }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Gửi tin nhắn" }),
    ).toBeVisible();
    await expect(
      page.getByRole("combobox", { name: "Chọn model" }),
    ).toBeVisible();
  });

  test("shows a structured error instead of hanging when the turn cannot reach a model", async ({
    page,
  }) => {
    await page.goto("/");

    await page
      .getByRole("textbox", { name: "Nội dung tin nhắn" })
      .fill("Xin chào");
    await page.getByRole("button", { name: "Gửi tin nhắn" }).click();

    // The visitor's own message is in the thread…
    await expect(page.getByText("Xin chào").last()).toBeVisible();

    // …and the failure arrives as an alert carrying words, not an empty box.
    // Scoped to the assistant turn: Next renders a route announcer that is also
    // `role="alert"`, and it is empty by design.
    const error = page
      .locator('[data-role="assistant"]')
      .getByRole("alert")
      .first();
    await expect(error).toBeVisible({ timeout: 30_000 });
    await expect(error).toContainText(/\S/);
  });

  test("offers the starter suggestions on an empty thread", async ({
    page,
  }) => {
    await page.goto("/");

    await expect(
      page.getByRole("button", { name: "Sử dụng tool hello-world" }),
    ).toBeVisible();
  });
});
