import { describe, expect, it } from "vitest";

import { getQueryClient } from "~/libs/query-client";

/**
 * Why a factory rather than the Vite Template's module-level client is written
 * once, in `src/libs/query-client.ts`. This file only pins the properties that
 * would otherwise regress silently; `test/root.test.ts` covers the other half,
 * that `root.tsx` reaches it through `useState`.
 */
describe("getQueryClient", () => {
  it("hands out a new client on every call", () => {
    expect(getQueryClient()).not.toBe(getQueryClient());
  });

  it("does not refetch the instant a server-rendered page hydrates", () => {
    // A zero `staleTime` would mark every query stale on mount and throw away
    // whatever the server already resolved.
    const { queries } = getQueryClient().getDefaultOptions();

    expect(queries?.staleTime).toBeGreaterThan(0);
  });

  it("surfaces a failed mutation once, from the cache rather than per hook", () => {
    // The global handler is what lets a mutation hook carry no error toast of
    // its own (see .agents/rules/tanstack-use-mutation.md).
    expect(getQueryClient().getMutationCache().config.onError).toBeTypeOf(
      "function",
    );
  });
});
