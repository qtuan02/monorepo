import { readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * The Derived contract (spec #144, ADR-0010), checked on the source as TEXT the
 * way `_template_reactrouter/test/entry.server.test.ts` reads its entry: what
 * has to hold is a property of the file, not the output of a call. Every hook
 * copied from hooks-ts opens with one exact header line naming the upstream
 * file, the pinned commit and the license; drop it and the notice obligation
 * is silently gone — 1.0.0 shipped exactly that way. `use-is-mobile.ts` is the
 * one Own file and is exempt.
 */
const PINNED_SHA = "9bd12431bb24b84d211f0d735c6bef79fe1be85a";
const OWN_FILES = new Set(["use-is-mobile.ts"]);
// The four hooks #145 copied, #149's two, plus #150's two; each later ticket only raises this.
const COPIED_SO_FAR = 8;

const HEADER =
  /^\/\/ Derived from hooks-ts (use[A-Z]\w*)\.ts @ ([0-9a-f]{40}) \(hooks-ts@0\.12\.0\), MIT © 2024 Michał Worwąg — see LICENSE-hooks-ts$/;

// `process.cwd()` is the package root — Vitest sets it from this config.
const srcDir = resolve(process.cwd(), "src");
const derivedFiles = readdirSync(srcDir).filter(
  (file) => file.endsWith(".ts") && !OWN_FILES.has(file),
);

describe("Derived header", () => {
  it("covers at least the hooks already copied", () => {
    expect(derivedFiles.length).toBeGreaterThanOrEqual(COPIED_SO_FAR);
  });

  it.each(derivedFiles)(
    "%s opens with the header at the pinned SHA",
    (file) => {
      const firstLine = readFileSync(resolve(srcDir, file), "utf8").split(
        "\n",
      )[0];
      const match = firstLine?.match(HEADER);

      expect(match, `${file}: line 1 is not the Derived header`).not.toBeNull();
      expect(match?.[2], `${file}: SHA differs from the pin`).toBe(PINNED_SHA);
    },
  );
});
