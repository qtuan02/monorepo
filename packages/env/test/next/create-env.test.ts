import { afterEach, describe, expect, it, vi } from "vitest";
import * as z from "zod";

import { createEnv } from "../../src/next/create-env";

const VALID_CLIENT_ENV = {
  NEXT_PUBLIC_APP_ENV: "local",
  NEXT_PUBLIC_BASE_DOMAIN_API: "http://localhost:8000",
};

// Prefixed so no value that happens to sit in the real `process.env` of a
// developer machine or a CI runner can satisfy it.
const SERVER_KEY = "MONOREPO_ENV_TEST_DATABASE_URL";

type ClientKey = keyof typeof VALID_CLIENT_ENV;

type ClientOverrides = Partial<Record<ClientKey, string | undefined>>;

/**
 * `isServer` is always stated rather than left to t3-env, which otherwise
 * decides server-vs-client from `typeof window` — under a DOM test environment
 * that silently skips the server half instead of validating it. The default is
 * the server side; the client-side cases pass `false` to cover the other half.
 */
function createBaseEnv(overrides: ClientOverrides = {}, isServer = true) {
  return createEnv({
    server: {},
    client: {},
    clientRuntimeEnv: { ...VALID_CLIENT_ENV, ...overrides },
    isServer,
  });
}

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("createEnv — the next Flavor", () => {
  it("returns the parsed values for a complete environment", () => {
    const env = createBaseEnv();

    expect(env.NEXT_PUBLIC_APP_ENV).toBe("local");
    expect(env.NEXT_PUBLIC_BASE_DOMAIN_API).toBe("http://localhost:8000");
  });

  it("throws naming the base variable that is missing", () => {
    expect(() =>
      createBaseEnv({ NEXT_PUBLIC_BASE_DOMAIN_API: undefined }),
    ).toThrow(/NEXT_PUBLIC_BASE_DOMAIN_API/);
  });

  it("throws when a URL carries a scheme other than http(s)", () => {
    expect(() =>
      createBaseEnv({
        NEXT_PUBLIC_BASE_DOMAIN_API: "ftp://files.example.test",
      }),
    ).toThrow(/Invalid environment/);
  });

  it("validates the server and client keys an app adds", () => {
    vi.stubEnv(SERVER_KEY, "https://db.example.test");

    const env = createEnv({
      server: { [SERVER_KEY]: z.url({ protocol: /^https?$/ }) },
      client: { NEXT_PUBLIC_ANALYTICS_ID: z.string().min(1) },
      clientRuntimeEnv: {
        ...VALID_CLIENT_ENV,
        NEXT_PUBLIC_ANALYTICS_ID: "analytics-local",
      },
      isServer: true,
    });

    expect(env[SERVER_KEY]).toBe("https://db.example.test");
    expect(env.NEXT_PUBLIC_ANALYTICS_ID).toBe("analytics-local");
    expect(env.NEXT_PUBLIC_APP_ENV).toBe("local");
  });

  it("throws when a server variable is missing from process.env", () => {
    expect(() =>
      createEnv({
        server: { [SERVER_KEY]: z.string().min(1) },
        client: {},
        clientRuntimeEnv: VALID_CLIENT_ENV,
        isServer: true,
      }),
    ).toThrow(new RegExp(SERVER_KEY));
  });

  it("throws when a server variable has the wrong scheme", () => {
    vi.stubEnv(SERVER_KEY, "postgres://localhost:5432/app");

    expect(() =>
      createEnv({
        server: { [SERVER_KEY]: z.url({ protocol: /^https?$/ }) },
        client: {},
        clientRuntimeEnv: VALID_CLIENT_ENV,
        isServer: true,
      }),
    ).toThrow(new RegExp(SERVER_KEY));
  });

  it("keeps the base client keys when the module evaluates on the client", () => {
    // The half that would silently break if the base block were ever filed
    // under `server`: t3-env drops the server dictionary entirely once
    // `isServer` is false, so those reads would come back undefined with
    // nothing thrown.
    const env = createEnv({
      server: {},
      client: {},
      clientRuntimeEnv: VALID_CLIENT_ENV,
      isServer: false,
    });

    expect(env.NEXT_PUBLIC_BASE_DOMAIN_API).toBe("http://localhost:8000");
  });

  it("still validates the base client keys on the client", () => {
    expect(() => createBaseEnv({ NEXT_PUBLIC_APP_ENV: "" }, false)).toThrow(
      /NEXT_PUBLIC_APP_ENV/,
    );
  });

  it("blocks a server variable from being read on the client", () => {
    vi.stubEnv(SERVER_KEY, "https://db.example.test");

    const env = createEnv({
      server: { [SERVER_KEY]: z.url({ protocol: /^https?$/ }) },
      client: {},
      clientRuntimeEnv: VALID_CLIENT_ENV,
      isServer: false,
    });

    expect(() => env[SERVER_KEY]).toThrow();
  });

  it("validates a shared variable on both sides", () => {
    const clientRuntimeEnv = { ...VALID_CLIENT_ENV, APP_TIER: "beta" };

    for (const isServer of [true, false]) {
      const env = createEnv({
        server: {},
        client: {},
        shared: { APP_TIER: z.enum(["beta", "stable"]) },
        clientRuntimeEnv,
        isServer,
      });

      expect(env.APP_TIER).toBe("beta");
    }
  });

  it("throws when a shared variable is outside its allowed values", () => {
    const clientRuntimeEnv = { ...VALID_CLIENT_ENV, APP_TIER: "canary" };

    expect(() =>
      createEnv({
        server: {},
        client: {},
        shared: { APP_TIER: z.enum(["beta", "stable"]) },
        clientRuntimeEnv,
        isServer: true,
      }),
    ).toThrow(/APP_TIER/);
  });
});
