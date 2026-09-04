// @vitest-environment node
//
// The rest of this app's suite runs on jsdom, and there `~/env` is the CLIENT
// half of itself: env-core decides which half a module hands out from `typeof
// window`, so a jsdom run cannot read the `server` block at all — it throws by
// name on access, which is the guarantee this Flavor exists for. This file is
// the one that reads `TEMPLATE_REACTROUTER_SESSION_SECRET`, so it needs the
// environment where that read is legal, and it is worth knowing that the same
// module answers differently in the two graphs.

import { afterEach, describe, expect, it, vi } from "vitest";

/**
 * `~/env` parses at module load, so every case has to re-import it, and
 * `resetModules` is what makes the next import re-run the parse.
 *
 * Only the **server** half can be stubbed. The client keys are literal
 * `import.meta.env.PUBLIC_*` reads that Vite substitutes while it transforms
 * this module — by the time a test runs there is no lookup left to intercept,
 * which is the same reason those values are baked into a production bundle.
 * `packages/env`'s own suite covers the client half, where it can pass
 * `runtimeEnv` directly.
 */
async function importEnv() {
  vi.resetModules();
  return await import("~/env");
}

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("env", () => {
  it("parses both halves of one module into a single object", async () => {
    const { env } = await importEnv();

    // Pinned by vitest.config.ts, so this does not depend on a developer's
    // local `.env`.
    expect(env.TEMPLATE_REACTROUTER_SESSION_SECRET).toBe("test-session-secret");
    // Read through Vite's `envDir` off the repo-root `.env`, so assert the
    // shape the schema promises rather than one machine's value.
    expect(env.PUBLIC_BASE_DOMAIN_API).toMatch(/^https?:\/\//);
    expect(env.PUBLIC_APP_ENV).not.toBe("");
  });

  it("throws naming the session secret when it is missing", async () => {
    // Empty string, not `undefined`: `emptyStringAsUndefined` is what turns a
    // blank line in `.env` into a missing value instead of a passing one.
    vi.stubEnv("TEMPLATE_REACTROUTER_SESSION_SECRET", "");

    await expect(importEnv()).rejects.toThrow(
      /TEMPLATE_REACTROUTER_SESSION_SECRET/,
    );
  });
});
