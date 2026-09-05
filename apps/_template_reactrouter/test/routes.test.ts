import type { RouteConfigEntry } from "@react-router/dev/routes";
import { href } from "react-router";
import { describe, expect, it } from "vitest";

import routes from "~/routes";

/**
 * The shape of the route table, asserted on the config object itself. The
 * table is the access model of this app: which routes sit under the guarded
 * layout is decided here and nowhere else, so a refactor that moved the
 * catch-all under the guard would turn every mistyped URL into a redirect to
 * sign-in — and no unit test of any single route module would notice.
 */
function findByFile(
  entries: readonly RouteConfigEntry[],
  file: string,
  ancestors: RouteConfigEntry[] = [],
): { entry: RouteConfigEntry; ancestors: RouteConfigEntry[] } | undefined {
  for (const entry of entries) {
    if (entry.file === file) return { entry, ancestors };
    const found = findByFile(entry.children ?? [], file, [...ancestors, entry]);
    if (found) return found;
  }
  return undefined;
}

function mustFind(file: string) {
  const found = findByFile(routes, file);
  if (!found) throw new Error(`no route uses ${file}`);
  return found;
}

describe("route table", () => {
  it("nests the catch-all inside the shell but outside the guarded layout", () => {
    const { entry, ancestors } = mustFind("routes/not-found.tsx");

    expect(entry.path).toBe("*");
    expect(ancestors.map((ancestor) => ancestor.file)).toEqual([
      "routes/layout.tsx",
    ]);
    // The guard is a sibling, never an ancestor: a signed-out visitor mistyping
    // a URL must read 404, not be bounced to sign-in.
    expect(ancestors.some((a) => a.file === "routes/protected.tsx")).toBe(
      false,
    );
  });

  it("keeps the guarded routes under a pathless guard inside the shell", () => {
    const { entry: guard, ancestors } = mustFind("routes/protected.tsx");

    expect(guard.path).toBeUndefined();
    expect(ancestors.map((ancestor) => ancestor.file)).toEqual([
      "routes/layout.tsx",
    ]);
    expect(
      mustFind("routes/dashboard.tsx").ancestors.map((a) => a.file),
    ).toEqual(["routes/layout.tsx", "routes/protected.tsx"]);
  });

  it("puts the public pages under the shell, and only the shell", () => {
    for (const file of [
      "routes/home.tsx",
      "routes/module.tsx",
      "routes/about.tsx",
    ]) {
      expect(mustFind(file).ancestors.map((a) => a.file)).toEqual([
        "routes/layout.tsx",
      ]);
    }
    expect(mustFind("routes/home.tsx").entry.index).toBe(true);
    expect(mustFind("routes/module.tsx").entry.path).toBe("modules/:slug");
  });

  it("keeps the chromeless routes outside the shell", () => {
    expect(mustFind("routes/sign-in.tsx").ancestors).toEqual([]);
    expect(mustFind("routes/sign-out.tsx").ancestors).toEqual([]);
  });
});

describe("href", () => {
  it("builds a module URL from the typed table", () => {
    expect(href("/modules/:slug", { slug: "dashboard" })).toBe(
      "/modules/dashboard",
    );
  });

  it("rejects a path the table does not declare at compile time", () => {
    // Lives in a real test file so `typecheck` fails the day this stops being
    // an error — which would mean the typed `href()` no longer guards links.
    // @ts-expect-error -- "/khong-ton-tai" is not a declared route
    expect(href("/khong-ton-tai")).toBe("/khong-ton-tai");
  });
});
