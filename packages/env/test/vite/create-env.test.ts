import { describe, expect, it } from "vitest";
import * as z from "zod";

import { createEnv } from "../../src/vite/create-env";
import { baseEnvSchema } from "../../src/vite/schema";

const VALID_ENV = {
  PUBLIC_APP_ENV: "local",
  PUBLIC_BASE_DOMAIN: "http://localhost:3000",
  PUBLIC_BASE_DOMAIN_API: "http://localhost:8000",
};

describe("createEnv — the vite Flavor", () => {
  it("returns the parsed values for a complete environment", () => {
    const env = createEnv(baseEnvSchema, VALID_ENV);

    expect(env.PUBLIC_APP_ENV).toBe("local");
    expect(env.PUBLIC_BASE_DOMAIN_API).toBe("http://localhost:8000");
  });

  it("drops a variable the schema does not declare", () => {
    const env = createEnv(baseEnvSchema, {
      ...VALID_ENV,
      PUBLIC_NOT_DECLARED: "leaked",
    });

    expect(env).not.toHaveProperty("PUBLIC_NOT_DECLARED");
  });

  it("throws naming the variable that is missing", () => {
    expect(() =>
      createEnv(baseEnvSchema, {
        ...VALID_ENV,
        PUBLIC_BASE_DOMAIN_API: undefined,
      }),
    ).toThrow(/PUBLIC_BASE_DOMAIN_API/);
  });

  it("throws when a URL carries a scheme other than http(s)", () => {
    expect(() =>
      createEnv(baseEnvSchema, {
        ...VALID_ENV,
        PUBLIC_BASE_DOMAIN: "ftp://files.example.test",
      }),
    ).toThrow(/Invalid environment/);
  });

  it("keeps an app's own variables when the base schema is extended", () => {
    const appEnvSchema = baseEnvSchema.extend({
      PUBLIC_ANALYTICS_ID: z.string().min(1),
    });

    const env = createEnv(appEnvSchema, {
      ...VALID_ENV,
      PUBLIC_ANALYTICS_ID: "ga-local-0001",
    });

    expect(env.PUBLIC_ANALYTICS_ID).toBe("ga-local-0001");
  });

  it("throws when an extended variable is missing", () => {
    const appEnvSchema = baseEnvSchema.extend({
      PUBLIC_ANALYTICS_ID: z.string().min(1),
    });

    expect(() => createEnv(appEnvSchema, VALID_ENV)).toThrow(
      /PUBLIC_ANALYTICS_ID/,
    );
  });
});
