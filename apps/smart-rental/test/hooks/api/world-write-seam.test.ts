import { readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * ADR-0015 §3/§4 — the seam is kept by a text scan, the same shape
 * `packages/hook/test/derived-header.test.ts` uses for the Derived header:
 * what has to hold is a property of the file, not the output of a call. A
 * mutation hook may not list a key of its own to invalidate — the global
 * `MutationCache.onSuccess` in `~/libs/query-client.ts` invalidates
 * everything — and no hook file may import another file's `*QueryKeys` to
 * do it by hand instead.
 */
const srcDir = resolve(process.cwd(), "src/hooks/api");
const files = readdirSync(srcDir).filter((file) => file.endsWith(".ts"));

const QUERY_KEYS_IMPORT =
  /import\s*\{[^}]*\bQueryKeys\b[^}]*\}\s*from\s*"~\/hooks\/api\//;

describe("world write seam — ~/hooks/api/*", () => {
  it("covers at least every hook file this ticket touched", () => {
    expect(files.length).toBeGreaterThanOrEqual(18);
  });

  it.each(files)("%s never calls invalidateQueries itself", (file) => {
    const source = readFileSync(resolve(srcDir, file), "utf8");
    expect(source).not.toContain("invalidateQueries");
  });

  it.each(files)("%s never imports another file's *QueryKeys", (file) => {
    const source = readFileSync(resolve(srcDir, file), "utf8");
    expect(source).not.toMatch(QUERY_KEYS_IMPORT);
  });
});
