import { afterEach, describe, expect, it, vi } from "vitest";

/**
 * `~/env` parses at module load, so every case has to re-import it. `vi.stubEnv`
 * writes over the values `vitest.config.ts` pins for the run, and `resetModules`
 * is what makes the next import re-run the parse.
 *
 * The environment here is jsdom, so t3-env validates the **client** half — which
 * is the half this app adds a key to. The server half is covered by
 * `packages/env`'s own suite, which pins `isServer` explicitly.
 */
async function importEnv() {
  vi.resetModules();
  return await import("~/env");
}

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("env", () => {
  it("returns the parsed values for a complete environment", async () => {
    const { env } = await importEnv();

    expect(env.NEXT_PUBLIC_APP_ENV).toBe("test");
    expect(env.NEXT_PUBLIC_BASE_DOMAIN_API).toBe("http://localhost:8000");
  });

  it("leaves the optional Sentry DSN undefined rather than throwing", async () => {
    const { env } = await importEnv();

    expect(env.NEXT_PUBLIC_SENTRY_DSN).toBeUndefined();
  });

  it("throws naming the variable when a base URL is missing", async () => {
    // Empty string, not `undefined`: `emptyStringAsUndefined` is what turns a
    // blank line in `.env` into a missing value instead of a passing one.
    vi.stubEnv("NEXT_PUBLIC_BASE_DOMAIN_API", "");

    await expect(importEnv()).rejects.toThrow(/NEXT_PUBLIC_BASE_DOMAIN_API/);
  });

  it("rejects a scheme-less base domain", async () => {
    // A bare "localhost:8000" parses as the scheme "localhost:", which is why
    // the shared schema pins http/https rather than using a plain `z.url()`.
    vi.stubEnv("NEXT_PUBLIC_BASE_DOMAIN_API", "localhost:8000");

    await expect(importEnv()).rejects.toThrow(/NEXT_PUBLIC_BASE_DOMAIN_API/);
  });

  it("rejects a Sentry DSN that is not an http(s) URL", async () => {
    vi.stubEnv("NEXT_PUBLIC_SENTRY_DSN", "not-a-url");

    await expect(importEnv()).rejects.toThrow(/Invalid environment/);
  });
});
