import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

import { createEnv } from "@monorepo/env/vite/create-env";
import { baseEnvSchema } from "@monorepo/env/vite/schema";

// `.env.example` at the repo root. Vitest's cwd is the app root
// (apps/_template_vite), so the root is two levels up.
const envExamplePath = resolve(process.cwd(), "../../.env.example");

/**
 * A minimal `.env` parser — one `KEY=VALUE` per line, comments and blank lines
 * skipped. Enough to turn `.env.example` into the plain object `createEnv`/Zod
 * expect, without pulling in a dotenv dependency for a test.
 */
function parseEnvFile(contents: string): Record<string, string> {
  const result: Record<string, string> = {};

  for (const line of contents.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex === -1) continue;

    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim();
    result[key] = value;
  }

  return result;
}

/**
 * `createEnv` itself is covered in @monorepo/env. What only this app can assert
 * is the wiring: that the committed `.env.example` every developer copies still
 * satisfies the schema `~/env.ts` parses at boot, so a new key added to one
 * without the other fails here rather than in a browser.
 */
describe("the app's environment", () => {
  it("parses the repo-root .env.example with the vite Flavor's base schema", () => {
    const parsed = parseEnvFile(readFileSync(envExamplePath, "utf-8"));

    expect(() => createEnv(baseEnvSchema, parsed)).not.toThrow();
  });

  it("ignores the NEXT_PUBLIC_* group that shares the same file", () => {
    const parsed = parseEnvFile(readFileSync(envExamplePath, "utf-8"));

    expect(createEnv(baseEnvSchema, parsed)).not.toHaveProperty(
      "NEXT_PUBLIC_APP_ENV",
    );
  });

  it("fails at boot, naming the variable, when one is missing", () => {
    const parsed = parseEnvFile(readFileSync(envExamplePath, "utf-8"));
    const { PUBLIC_BASE_DOMAIN_API: _omitted, ...incomplete } = parsed;

    expect(() => createEnv(baseEnvSchema, incomplete)).toThrow(
      /PUBLIC_BASE_DOMAIN_API/,
    );
  });
});
