"use server";

import { revalidateTag } from "next/cache";

import { HOME_CATALOGUE_TAG } from "~/features/home/server/home-catalogue";

/**
 * Drops the cached catalogue so the next request rebuilds it.
 *
 * Two arguments, not one: Next 16 deprecated the bare `revalidateTag(tag)`. The
 * second names the `cacheLife` profile the invalidation follows, and passing the
 * same profile the entry was written with (`hours`) is what gives
 * stale-while-revalidate instead of a cliff — a request arriving mid-refresh is
 * served the previous value rather than made to wait.
 */
export async function refreshHomeCatalogue(): Promise<void> {
  revalidateTag(HOME_CATALOGUE_TAG, "hours");
}
