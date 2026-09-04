import { describe, expect, it } from "vitest";
import * as z from "zod";

import { createEnv } from "../../src/react-router/create-env";
import { baseClientSchema } from "../../src/react-router/schema";
import { baseEnvSchema } from "../../src/vite/schema";

const VALID_CLIENT_ENV = {
  PUBLIC_APP_ENV: "local",
  PUBLIC_BASE_DOMAIN: "http://localhost:3005",
  PUBLIC_BASE_DOMAIN_API: "http://localhost:8000",
};

// Prefixed so no value that happens to sit in the real `process.env` of a
// developer machine or a CI runner can satisfy it.
const SERVER_KEY = "MONOREPO_ENV_TEST_SESSION_SECRET";

type RuntimeOverrides = Record<string, string | undefined>;

/**
 * `isServer` is always stated rather than left to env-core, which otherwise
 * decides server-vs-client from `typeof window`. This package's runner is
 * `node`, so the probe would always answer "server" and the client half would
 * never be exercised; the client-side cases pass `false` to reach it.
 *
 * Note the difference from the `next` Flavor's tests: there the whole map is
 * the client half and server values come from `process.env`, so they are
 * stubbed with `vi.stubEnv`. env-core reads only `runtimeEnv`, so a server
 * value is simply another entry in this object.
 */
function createBaseEnv(overrides: RuntimeOverrides = {}, isServer = true) {
  return createEnv({
    server: {},
    client: {},
    runtimeEnv: { ...VALID_CLIENT_ENV, ...overrides },
    isServer,
  });
}

describe("createEnv — the react-router Flavor", () => {
  it("returns the parsed values for a complete environment", () => {
    const env = createEnv({
      server: { [SERVER_KEY]: z.string().min(1) },
      client: { PUBLIC_ANALYTICS_ID: z.string().min(1) },
      runtimeEnv: {
        ...VALID_CLIENT_ENV,
        PUBLIC_ANALYTICS_ID: "analytics-local",
        [SERVER_KEY]: "s3cret",
      },
      isServer: true,
    });

    expect(env.PUBLIC_APP_ENV).toBe("local");
    expect(env.PUBLIC_BASE_DOMAIN_API).toBe("http://localhost:8000");
    expect(env.PUBLIC_ANALYTICS_ID).toBe("analytics-local");
    expect(env[SERVER_KEY]).toBe("s3cret");
  });

  it("treats an empty string as a missing value, not a passing one", () => {
    // `emptyStringAsUndefined` deletes the blank entries before parsing, so a
    // blank line in `.env` (`PUBLIC_OPTIONAL_FLAG=`) reads as a *missing* value
    // rather than as the empty string.
    //
    // The key is optional on purpose: it is the only shape whose outcome
    // differs between the flag being on and off. A required key throws either
    // way — "expected string, received undefined" with the flag, "expected
    // string to have >=1 characters" without it — so a test on one would stay
    // green if the flag were deleted.
    const env = createEnv({
      server: {},
      client: { PUBLIC_OPTIONAL_FLAG: z.string().min(1).optional() },
      runtimeEnv: { ...VALID_CLIENT_ENV, PUBLIC_OPTIONAL_FLAG: "" },
      isServer: true,
    });

    expect(env.PUBLIC_OPTIONAL_FLAG).toBeUndefined();
  });

  it("does not mutate the runtimeEnv object it is handed", () => {
    // `emptyStringAsUndefined` is implemented by deleting the empty keys from
    // whatever object is passed in, so the wrapper copies first.
    const runtimeEnv = { ...VALID_CLIENT_ENV, PUBLIC_ANALYTICS_ID: "" };

    expect(() =>
      createEnv({
        server: {},
        client: { PUBLIC_ANALYTICS_ID: z.string().min(1) },
        runtimeEnv,
        isServer: true,
      }),
    ).toThrow(/PUBLIC_ANALYTICS_ID/);

    expect(runtimeEnv).toHaveProperty("PUBLIC_ANALYTICS_ID", "");
  });

  it("throws naming the base variable that is missing", () => {
    expect(() => createBaseEnv({ PUBLIC_BASE_DOMAIN_API: undefined })).toThrow(
      /PUBLIC_BASE_DOMAIN_API/,
    );
  });

  it("throws when a PUBLIC_ URL carries a scheme other than http(s)", () => {
    expect(() =>
      createBaseEnv({ PUBLIC_BASE_DOMAIN: "ftp://files.example.test" }),
    ).toThrow(/PUBLIC_BASE_DOMAIN/);
  });

  it("throws naming the server variable that is missing", () => {
    expect(() =>
      createEnv({
        server: { [SERVER_KEY]: z.string().min(1) },
        client: {},
        runtimeEnv: { ...VALID_CLIENT_ENV, [SERVER_KEY]: undefined },
        isServer: true,
      }),
    ).toThrow(new RegExp(SERVER_KEY));
  });

  it("keeps the base client keys when the module evaluates on the client", () => {
    const env = createBaseEnv({}, false);

    expect(env.PUBLIC_BASE_DOMAIN).toBe("http://localhost:3005");
  });

  it("still validates the base client keys on the client", () => {
    // The half that would silently break if the base block were ever filed
    // under `server`: env-core drops the server dictionary entirely once
    // `isServer` is false, so those reads would stop being validated at all.
    expect(() =>
      createBaseEnv({ PUBLIC_BASE_DOMAIN: "ftp://files.example.test" }, false),
    ).toThrow(/PUBLIC_BASE_DOMAIN/);
  });

  it("blocks a server variable from being read on the client", () => {
    // The whole reason this Flavor has a `server` block at all: one Vite build
    // produces both halves, so nothing but this Proxy stops a component from
    // reading a secret.
    const env = createEnv({
      server: { [SERVER_KEY]: z.string().min(1) },
      client: {},
      runtimeEnv: { ...VALID_CLIENT_ENV, [SERVER_KEY]: "s3cret" },
      isServer: false,
    });

    expect(() => env[SERVER_KEY]).toThrow(new RegExp(SERVER_KEY));
  });

  it("skips the server half entirely on the client", () => {
    // A missing server value must not break the browser bundle, which never
    // had it in the first place.
    const env = createEnv({
      server: { [SERVER_KEY]: z.string().min(1) },
      client: {},
      runtimeEnv: { ...VALID_CLIENT_ENV, [SERVER_KEY]: undefined },
      isServer: false,
    });

    expect(env.PUBLIC_APP_ENV).toBe("local");
  });

  it("validates a shared variable on both sides", () => {
    // A `shared` key carries no client prefix, so it is also the one name the
    // client-access Proxy must let through rather than treat as a server read.
    for (const isServer of [true, false]) {
      const env = createEnv({
        server: {},
        client: {},
        shared: { APP_TIER: z.enum(["beta", "stable"]) },
        runtimeEnv: { ...VALID_CLIENT_ENV, APP_TIER: "beta" },
        isServer,
      });

      expect(env.APP_TIER).toBe("beta");
    }
  });

  it("throws when a shared variable is outside its allowed values", () => {
    expect(() =>
      createEnv({
        server: {},
        client: {},
        shared: { APP_TIER: z.enum(["beta", "stable"]) },
        runtimeEnv: { ...VALID_CLIENT_ENV, APP_TIER: "canary" },
        isServer: true,
      }),
    ).toThrow(/APP_TIER/);
  });

  it("declares the same PUBLIC_ keys, parsing the same way, as the vite Flavor", () => {
    // The drift guard for the deliberate duplication: this Flavor re-declares
    // the base keys rather than importing `../vite/schema`, because a Flavor
    // never imports another Flavor. Key names alone would not catch the drift
    // that matters — relaxing one side's `httpUrlSchema` to a bare
    // `z.string()` leaves both key sets identical — so every key is run over
    // the same probe values and the two verdicts must agree.
    const probes = [
      "",
      "local",
      "http://localhost:3000",
      "https://api.example.test",
      "ftp://files.example.test",
      "localhost:8000",
    ];

    const verdicts = (shape: Record<string, z.ZodType>) =>
      Object.fromEntries(
        Object.entries(shape).map(([key, schema]) => [
          key,
          probes.map((probe) => schema.safeParse(probe).success),
        ]),
      );

    expect(Object.keys(baseClientSchema).sort()).toEqual(
      Object.keys(baseEnvSchema.shape).sort(),
    );
    expect(verdicts(baseClientSchema)).toEqual(verdicts(baseEnvSchema.shape));
  });
});
