import { describe, expect, it } from "vitest";

import { chatErrorCode } from "~/features/chat/utils/chat-error-code";

/**
 * The classifier is the whole of the chat's failure path, and it is the one
 * place a wrong answer is invisible: every branch renders *some* alert, so an
 * "out of quota" told as "check your key" would send a visitor to change a key
 * that is fine. The strings here are the ones Google actually returns.
 */
describe("chatErrorCode", () => {
  it("names a rejected key so the reader knows which variable to fix", () => {
    expect(
      chatErrorCode(
        new Error("API key not valid. Please pass a valid API key."),
      ),
    ).toBe("credential");
  });

  it.each([
    "PERMISSION_DENIED: request had insufficient authentication scopes",
    "UNAUTHENTICATED",
    "API key expired. Please renew the API key.",
  ])("treats %s as a credential problem", (message) => {
    expect(chatErrorCode(new Error(message))).toBe("credential");
  });

  it.each([
    "RESOURCE_EXHAUSTED: quota exceeded",
    "429 Too Many Requests",
    "You exceeded your current rate limit",
  ])("treats %s as a rate limit", (message) => {
    expect(chatErrorCode(new Error(message))).toBe("rateLimit");
  });

  it("prefers the quota reading when a rejection mentions both", () => {
    // Google's 429 body names the API key as well as the quota. The quota is
    // the half a visitor can act on — waiting or switching model — so it wins.
    expect(
      chatErrorCode(
        new Error(
          "429 RESOURCE_EXHAUSTED: Quota exceeded for this API key not valid for more requests",
        ),
      ),
    ).toBe("rateLimit");
  });

  it("falls back to the generic cause for anything unrecognised", () => {
    expect(chatErrorCode(new Error("fetch failed"))).toBe("generic");
    expect(chatErrorCode("something odd")).toBe("generic");
    expect(chatErrorCode(undefined)).toBe("generic");
  });
});
