import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { describe, expect, it } from "vitest";

import { languages, messages } from "@monorepo/i18n/languages";

import { componentCatalogue, hookCatalogue } from "~/constants/docs-catalogue";
import { HOOK_PACKAGE_NAME, UI_PACKAGE_NAME } from "~/constants/packages";

/**
 * Rules the generated catalogues have to hold to that no type can express.
 *
 * `DocsCatalogue` already forces the shape of an entry. What it cannot see is
 * whether the catalogue still describes the packages: a primitive added with
 * `ui-add`, or a hook renamed, leaves every type happy and simply goes missing
 * from the site — a page nobody notices is absent. This is the same job
 * `catalogue-invariants.test.ts` does for `@monorepo/i18n`, one level up: the
 * source directory is the source of truth, and the derived artefact is checked
 * against it rather than trusted.
 *
 * It runs against the JSON `pretest` has just regenerated, so a stale
 * `src/generated/` cannot make it pass.
 */

// Vitest's cwd is the app root, so the repo root is two levels up.
const repoRoot = resolve(process.cwd(), "../..");

function sourceSlugs(directory: string, extension: string): string[] {
  return readdirSync(join(repoRoot, directory))
    .filter((fileName) => fileName.endsWith(extension))
    .map((fileName) => fileName.slice(0, -extension.length));
}

/**
 * Membership, not order: the invariant is that the catalogue still describes
 * the directory. Both sides are sorted the same way here so a failure prints a
 * readable diff — what order the generator emits is its own business (it sorts
 * by file name, so `message-scroller` lands before `message`), and asserting it
 * here would report a rename twice.
 */
function sorted(slugs: readonly string[]): string[] {
  return [...slugs].sort((left, right) => left.localeCompare(right));
}

describe("the component catalogue", () => {
  const slugs = sourceSlugs("packages/ui/src/components", ".tsx");

  it("carries an entry for every file in packages/ui/src/components", () => {
    expect(sorted(componentCatalogue.items.map((item) => item.slug))).toEqual(
      sorted(slugs),
    );
  });

  it("names the published package, not the workspace one", () => {
    expect(componentCatalogue.package).toBe(UI_PACKAGE_NAME);

    const offenders = componentCatalogue.items
      .filter((item) => !item.importPath.startsWith(`${UI_PACKAGE_NAME}/`))
      .map((item) => item.slug);

    // A snippet spelling `@monorepo/ui` would be uncopyable: that name is
    // private to this workspace and resolves to nothing on a consumer's machine.
    expect(offenders).toEqual([]);
  });

  it("lists at least one export per primitive", () => {
    const offenders = componentCatalogue.items
      .filter((item) => item.exports.length === 0)
      .map((item) => item.slug);

    // An empty export table means the parser lost the module, not that the
    // primitive exports nothing — every file in that directory exports its
    // component by name.
    expect(offenders).toEqual([]);
  });
});

describe("the hook catalogue", () => {
  const slugs = sourceSlugs("packages/hook/src", ".ts");

  it("carries an entry for every file in packages/hook/src", () => {
    expect(sorted(hookCatalogue.items.map((item) => item.slug))).toEqual(
      sorted(slugs),
    );
  });

  it("names the published package and exports the hook itself", () => {
    expect(hookCatalogue.package).toBe(HOOK_PACKAGE_NAME);

    const offenders = hookCatalogue.items
      .filter(
        (item) =>
          !item.importPath.startsWith(`${HOOK_PACKAGE_NAME}/`) ||
          item.exports.length === 0,
      )
      .map((item) => item.slug);

    expect(offenders).toEqual([]);
  });
});

/**
 * The one derived value the generator cannot verify where it runs: `turbo prune
 * --docker` drops `apps/storybook` from the build context, so the script has no
 * stories directory to look a title up in and derives the id from the slug
 * instead (plus a small override table). This is the checkout that does have
 * them, which makes it the only place the derivation can be checked.
 */
describe("every component's Storybook demo link", () => {
  const storiesDirectory = resolve(repoRoot, "apps/storybook/src/stories");

  it.runIf(existsSync(storiesDirectory))(
    "points at a docs id a real story produces",
    () => {
      // Storybook lower-cases the title and collapses every run of
      // non-alphanumeric characters into a single dash.
      const docsIds = new Set(
        readdirSync(storiesDirectory)
          .filter((fileName) => fileName.endsWith(".stories.tsx"))
          .flatMap((fileName) => {
            const source = readFileSync(
              join(storiesDirectory, fileName),
              "utf8",
            );
            const title = /title:\s*"([^"]+)"/.exec(source)?.[1];

            return title
              ? [
                  title
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, "-")
                    .replace(/^-|-$/g, ""),
                ]
              : [];
          }),
      );

      const offenders = componentCatalogue.items
        .filter((item) => !docsIds.has(item.storybookDocsId))
        .map((item) => `${item.slug} → ${item.storybookDocsId}`);

      expect(offenders).toEqual([]);
    },
  );
});

/**
 * The catalogue is generated; the prose that describes each hook is not.
 *
 * `hook-card.tsx` and `hook-detail.template.tsx` both read a hook's description
 * through a key built from its slug, and i18next answers a missing key by
 * returning the key itself — so adding `packages/hook/src/use-foo.ts` (the very
 * move the invariant above *requires* to keep passing) would ship the literal
 * string `documents.hooks.items.use-foo.description` to a reader, in two
 * places, with nothing red. Nothing else can catch it: the repo declares no
 * i18next `CustomTypeOptions`, so `t()` accepts any string and `typecheck`
 * stays green.
 */
describe("every hook's description", () => {
  it("exists in every language, for every generated slug", () => {
    const missing = languages.flatMap((code) => {
      const items = messages[code].documents.hooks.items as Record<
        string,
        { description?: string } | undefined
      >;

      return hookCatalogue.items
        .filter((item) => !items[item.slug]?.description)
        .map((item) => `${code}: ${item.slug}`);
    });

    expect(missing).toEqual([]);
  });
});
