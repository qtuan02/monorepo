import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

import { I18N_PROXY_MATCHER } from "@monorepo/i18n/next-intl/proxy-matcher";

/**
 * `src/proxy.ts` is read as **text**, not imported. Importing it pulls in
 * `next-intl/middleware`, which reaches for `next/server` — a specifier a plain
 * ESM resolver cannot follow, because `next` ships no `exports` map. That is the
 * same reason the matcher lives in its own module in `@monorepo/i18n`.
 */
// `process.cwd()` is the app root — Vitest sets it from this project's config.
// `import.meta.url` is not usable here: under the jsdom environment it is not a
// `file:` URL, so `fileURLToPath` throws.
const proxySource = readFileSync(
  resolve(process.cwd(), "src/proxy.ts"),
  "utf8",
);

describe("proxy config", () => {
  /**
   * A regression test for a bug that shipped: the literal had lost its two
   * backslashes, so `.*..*` read as "any character" instead of "a dot". The
   * negative lookahead then rejected every path with at least one character in
   * it and the proxy ran on nothing at all — no locale negotiation, and a
   * a visitor got the wrong language with no negotiation at all.
   *
   * Nothing else can catch this. The value has to be a literal, because Next
   * extracts `config` by statically analysing the file and silently ignores an
   * identifier it cannot evaluate; and a wrong-but-valid regex fails open, so
   * the build stays green and only a request shows the damage.
   */
  it("copies the shared matcher literally, escapes included", () => {
    const matcher = proxySource.match(/matcher:\s*"([^"]*)"/)?.[1];

    expect(matcher).toBeDefined();
    // Both sides are TypeScript source, so both spell an escaped dot `\\.`.
    expect(matcher).toBe(JSON.stringify(I18N_PROXY_MATCHER).slice(1, -1));
  });

  it("still matches a real page path once the escapes are right", () => {
    const matcher = proxySource.match(/matcher:\s*"([^"]*)"/)?.[1] ?? "";
    // Undo the source-level escaping to get the runtime string Next compiles.
    const pattern = new RegExp(`^${JSON.parse(`"${matcher}"`)}$`);

    expect(pattern.test("/")).toBe(true);
    expect(pattern.test("/en")).toBe(true);
    // …and still excludes assets and API routes.
    expect(pattern.test("/favicon.ico")).toBe(false);
    expect(pattern.test("/_next/static/chunk.js")).toBe(false);
    expect(pattern.test("/api/health")).toBe(false);
  });
});
