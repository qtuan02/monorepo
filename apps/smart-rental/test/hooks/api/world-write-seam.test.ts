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

/**
 * ADR-0015 §1/§4 (ticket #208) — the read half of the same seam:
 * `readWorld` in `~/libs/mock-world` is the one function outside a
 * `mutationFn` allowed to touch `~/constants/mock`; every `queryFn` reads
 * through it instead. A `mutationFn` still writes the Mock directly
 * (ADR-0012 §3, ADR-0015 §1) — every file's factory declaration
 * (`QueryKeyFactory = queryKeysFactory(...)`) marks where its imports end,
 * and every file's own convention is query hooks first, mutation hooks
 * after, so the text between those two markers is exactly a file's read
 * path. A `mockXxx` identifier appearing there — not merely a
 * `~/constants/mock` import line, which a file with a mutation still needs —
 * is a queryFn that skipped `readWorld`.
 */
const FACTORY_MARKER = "QueryKeyFactory = queryKeysFactory(";
const MOCK_IDENTIFIER = /\bmock[A-Z]\w*/;

function readPath(source: string): string {
  const bodyStart = source.indexOf(FACTORY_MARKER);
  const body = bodyStart === -1 ? source : source.slice(bodyStart);
  const mutationIndex = body.indexOf("mutationFn:");
  return mutationIndex === -1 ? body : body.slice(0, mutationIndex);
}

describe("world read seam — ~/hooks/api/*", () => {
  it.each(files)(
    "%s's read path never references a mock array directly",
    (file) => {
      const source = readFileSync(resolve(srcDir, file), "utf8");
      expect(readPath(source)).not.toMatch(MOCK_IDENTIFIER);
    },
  );
});
