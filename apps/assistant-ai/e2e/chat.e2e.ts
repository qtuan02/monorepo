import { expect, test } from "@playwright/test";

/**
 * The three sentences this app is allowed to end a failed turn with — the `vi`
 * half of `assistantAi.errors` in `packages/i18n`.
 *
 * Literals, not an import: Playwright's loader will not take the catalogue's
 * JSON without an import attribute, and deriving them from the code under test
 * would be worse anyway — a message rewritten to something unhelpful would keep
 * passing. If this list goes stale the spec fails, which is the right noise for
 * a change to what a visitor reads when the app breaks.
 */
const CHAT_ERRORS = [
  "Máy chủ chưa được cấu hình khoá Gemini hợp lệ. Vui lòng liên hệ người quản trị.",
  "Model đang quá tải hoặc đã hết hạn mức. Chọn model khác hoặc thử lại sau ít phút.",
  "Không gọi được model. Vui lòng thử lại sau ít phút.",
];

/**
 * The chat screen on the **built** app.
 *
 * The model itself is out of scope here — a spec that talked to Gemini would
 * need a real key in CI and would be flaky by construction. What is in scope is
 * the boundary either side of it: the surface a visitor is handed, and the fact
 * that a turn which cannot reach a model ends as a readable error rather than a
 * spinner that never stops.
 *
 * That second assertion holds however the turn fails, and that is deliberate.
 * CI builds with the placeholder key from `.env.example`, so Google rejects it;
 * on a machine with no egress the same send fails to connect instead. Both are
 * classified by `~/features/chat/utils/chat-error-code.ts`, so the spec asserts
 * what it can prove either way — that the alert carries **one of this app's own
 * three messages**, not a raw provider string, a blank box, or a spinner. Which
 * cause maps to which message is pinned without a network in
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

    // …and the failure arrives as one of this app's own three messages. Scoped to
    // the assistant turn, because Next renders a route announcer that also
    // carries `role="alert"` and is empty by design.
    const error = page
      .locator('[data-role="assistant"]')
      .getByRole("alert")
      .first();
    await expect(error).toBeVisible({ timeout: 30_000 });
    expect(CHAT_ERRORS).toContain((await error.textContent())?.trim());
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
