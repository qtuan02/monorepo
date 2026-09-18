import { describe, expect, it } from "vitest";

import { queryClient } from "~/libs/query-client";

/**
 * ADR-0015 §3 — World's write seam: one `MutationCache.onSuccess`
 * invalidates every cached query after any mutation succeeds, so no
 * `~/hooks/api/*` mutation hook lists a key of its own any more.
 */
describe("queryClient", () => {
  it("surfaces a failed mutation once, from the cache rather than per hook", () => {
    expect(queryClient.getMutationCache().config.onError).toBeTypeOf(
      "function",
    );
  });

  it("marks every cached query stale once any mutation succeeds", async () => {
    queryClient.clear();
    queryClient.setQueryData(["some-entity"], "cached");
    const query = queryClient
      .getQueryCache()
      .find({ queryKey: ["some-entity"] });
    expect(query?.isStale()).toBe(false);

    const mutation = queryClient
      .getMutationCache()
      .build(queryClient, { mutationFn: async () => "ok" });
    await mutation.execute(undefined);

    expect(query?.isStale()).toBe(true);
  });
});
