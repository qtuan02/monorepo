import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

import { createEnv } from "@monorepo/env/vite/create-env";

import { envSchema } from "~/env";

// `.env.example` at the repo root. Vitest's cwd is the app root, so the root is
// two levels up.
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

const example = parseEnvFile(readFileSync(envExamplePath, "utf-8"));

/**
 * `createEnv` itself is covered in @monorepo/env. What only this app can assert
 * is the wiring: that the committed `.env.example` every developer copies still
 * satisfies **this app's** schema — the base one plus the Storybook URL every
 * primitive page builds its demo link from. A key added to `~/env.ts` without
 * `.env.example` (or the other way round) fails here rather than in a browser.
 */
describe("the app's environment", () => {
  it("parses the repo-root .env.example with this app's own schema", () => {
    expect(() => createEnv(envSchema, example)).not.toThrow();
  });

  it("ignores the NEXT_PUBLIC_* group that shares the same file", () => {
    expect(createEnv(envSchema, example)).not.toHaveProperty(
      "NEXT_PUBLIC_APP_ENV",
    );
  });

  it("fails at boot, naming the variable, when the Storybook URL is missing", () => {
    const { PUBLIC_DOCUMENTS_STORYBOOK_URL: _omitted, ...incomplete } = example;

    // Required, not optional: the demo link is the whole point of a primitive
    // page, so a missing value should stop the image build rather than ship 63
    // pages linking nowhere.
    expect(() => createEnv(envSchema, incomplete)).toThrow(
      /PUBLIC_DOCUMENTS_STORYBOOK_URL/,
    );
  });

  it("rejects a Storybook URL that is not an http(s) URL", () => {
    expect(() =>
      createEnv(envSchema, {
        ...example,
        PUBLIC_DOCUMENTS_STORYBOOK_URL: "localhost:6006",
      }),
    ).toThrow(/PUBLIC_DOCUMENTS_STORYBOOK_URL/);
  });
});
