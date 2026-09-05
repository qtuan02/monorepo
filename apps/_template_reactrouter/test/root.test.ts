import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { RouterContextProvider } from "react-router";
import { describe, expect, it, vi } from "vitest";

import { LANGUAGE_COOKIE_NAME } from "~/constants/cookies";
import { languageContext } from "~/libs/language-context";
import { loader, middleware } from "~/root";

/**
 * The per-request language decision, asserted where it is actually made.
 *
 * `createRoutesStub` cannot help here: its route objects accept no `middleware`
 * key at all, so a stub would silently render with an empty context and prove
 * nothing. The middleware is a plain function over a `Request` and a
 * `RouterContextProvider` though, and both are constructible — which is the
 * whole reason the decision lives in `@monorepo/i18n/resolve-language` and this
 * file only wires it.
 */
function argsFor(headers: Record<string, string>) {
  const url = "http://localhost/";

  return {
    request: new Request(url, { headers }),
    url: new URL(url),
    params: {},
    pattern: "/",
    context: new RouterContextProvider(),
  };
}

async function decide(headers: Record<string, string>) {
  const args = argsFor(headers);
  const next = vi.fn(async () => new Response(null));

  const entry = middleware[0];
  if (!entry) throw new Error("root exports no middleware");

  await entry(args, next);

  return { context: args.context, next };
}

describe("root middleware", () => {
  it("prefers the cookie over the browser's header", async () => {
    const { context } = await decide({
      cookie: `${LANGUAGE_COOKIE_NAME}=vi`,
      "accept-language": "en-GB,en;q=0.9",
    });

    // The visitor's explicit choice beats the browser default they never picked
    // — the same order the i18next detector runs in the browser.
    expect(context.get(languageContext)).toBe("vi");
  });

  it("negotiates the header when no cookie was sent", async () => {
    const { context } = await decide({ "accept-language": "en-US,en;q=0.9" });

    expect(context.get(languageContext)).toBe("en");
  });

  it("falls back to the registry default when the request says nothing", async () => {
    const { context } = await decide({});

    expect(context.get(languageContext)).toBe("vi");
  });

  it("hands the request on rather than answering it", async () => {
    const { next } = await decide({});

    // A middleware that forgets to call `next` swallows the response. It is one
    // line to get wrong and produces a hang rather than an error.
    expect(next).toHaveBeenCalledTimes(1);
  });
});

describe("root loader", () => {
  it("carries the decided language into the payload", () => {
    const args = argsFor({});
    args.context.set(languageContext, "en");

    // Read from the context, not re-derived from the request: the loader is
    // what puts root's decision where a child route's `meta` can reach it, and
    // the request handed in here deliberately asks for no language at all.
    expect(loader(args)).toEqual({ language: "en" });
  });
});

/**
 * Read as TEXT, the same seam `test/entry.server.test.ts` uses: what has to hold
 * is a property of the file, not the output of a call. A module-level
 * `new QueryClient()` is correct in the Vite Template and wrong here — this
 * module is loaded once per Node process and shared by every request being
 * rendered at that moment, so one visitor's cache would reach the next. Nothing
 * fails at runtime when it happens; the symptom is data in someone else's HTML.
 */
const source = readFileSync(resolve(process.cwd(), "src/root.tsx"), "utf8");

/**
 * Every source file except the factory itself, which is the one place the
 * constructor belongs. Vite's `import.meta.glob` resolves the set at transform
 * time, so a file added tomorrow is covered without anyone remembering to list
 * it. `import: "default"` is what makes each value the file's text — without it
 * the value is the module record and the type says otherwise, which is exactly
 * how a check like this ends up reading `undefined` and passing on everything.
 */
const appSources = Object.entries(
  import.meta.glob<string>("../src/**/*.{ts,tsx}", {
    eager: true,
    query: "?raw",
    import: "default",
  }),
).filter(([path]) => !path.endsWith("src/libs/query-client.ts"));

describe("root providers", () => {
  it("builds the query client per render tree, never at module scope", () => {
    expect(source).toContain("useState(getQueryClient)");
  });

  it("leaves the constructor to the factory, everywhere in src/", () => {
    // Not `root.tsx` alone: the invariant is about the whole app. A
    // `new QueryClient()` anywhere else is a module-level client by
    // construction, and on a server that is one visitor's cache reaching the
    // next — a failure with no runtime symptom of its own.
    const offenders = appSources
      .filter(([, text]) => text.includes("new QueryClient("))
      .map(([path]) => path);

    expect(offenders).toEqual([]);
  });

  it("puts the provider in Layout, so an error render keeps it", () => {
    // `Layout` wraps whichever of `App`, `ErrorBoundary` and `HydrateFallback`
    // is current; inside `App` the provider would unmount on a thrown error and
    // come back with an empty cache.
    const layout = source.slice(source.indexOf("export function Layout"));

    expect(layout).toContain("<QueryClientProvider client={queryClient}>");
  });
});
