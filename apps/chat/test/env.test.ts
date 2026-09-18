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
 * satisfies **this app's** schema — the base one plus the two `chat-socket`
 * backend keys. A key added to `~/env.ts` without `.env.example` (or the other
 * way round) fails here rather than in a browser.
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

  it("fails at boot, naming the variable, when the API base URL is missing", () => {
    const { PUBLIC_CHAT_API_BASE_URL: _omitted, ...incomplete } = example;

    expect(() => createEnv(envSchema, incomplete)).toThrow(
      /PUBLIC_CHAT_API_BASE_URL/,
    );
  });

  it("fails at boot, naming the variable, when the socket URL is missing", () => {
    const { PUBLIC_CHAT_SOCKET_URL: _omitted, ...incomplete } = example;

    expect(() => createEnv(envSchema, incomplete)).toThrow(
      /PUBLIC_CHAT_SOCKET_URL/,
    );
  });

  it("rejects a socket URL that is not ws(s)", () => {
    expect(() =>
      createEnv(envSchema, {
        ...example,
        PUBLIC_CHAT_SOCKET_URL: "http://localhost:8089/api/ws",
      }),
    ).toThrow(/PUBLIC_CHAT_SOCKET_URL/);
  });
});
