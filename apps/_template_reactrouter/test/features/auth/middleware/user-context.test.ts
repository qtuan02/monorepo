import { RouterContextProvider } from "react-router";
import { describe, expect, it } from "vitest";

import { userContext } from "~/features/auth/middleware/user-context";

describe("userContext", () => {
  it("throws when read outside the guard, instead of answering with nobody", () => {
    // A loader that reaches this without `requireSession` having run is a route
    // mounted outside the guarded group by mistake. That has to be a 500 on the
    // first request, not a dashboard rendered for an unchecked visitor —
    // which is what a `null` default would quietly allow.
    expect(() => new RouterContextProvider().get(userContext)).toThrow();
  });

  it("hands back exactly what the guard set", () => {
    const context = new RouterContextProvider();
    const user = { id: "u-1", name: "Nguyễn Văn A" };

    context.set(userContext, user);

    expect(context.get(userContext)).toBe(user);
  });
});
