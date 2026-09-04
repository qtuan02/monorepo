import type { CSSProperties } from "react";

/**
 * The width every message row, the welcome block and the composer line up on.
 *
 * A constant rather than a literal at each call site because **two files that
 * cannot see each other** have to agree on it: the thread declares it, and
 * `ChatSkeleton` is its `<Suspense>` fallback — a sibling, not a child, so it
 * inherits nothing. That is the case
 * `.agents/rules/quality-styling-tailwind.md` reserves a shared measurement for;
 * a copy in each file would drift the first time one of them is retuned.
 */
export const THREAD_WIDTH_STYLE: CSSProperties = {
  "--thread-max-width": "44rem",
} as CSSProperties;
