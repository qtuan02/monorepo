import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { parseSync } from "oxc-parser";

import type {
  ComponentDocsEntry,
  DocsCatalogue,
  DocsEntry,
} from "../src/types/docs-catalogue.ts";
import {
  HOOK_PACKAGE_NAME,
  HOOK_SUBPATH_PREFIX,
  UI_COMPONENT_SUBPATH_PREFIX,
  UI_PACKAGE_NAME,
} from "../src/constants/packages.ts";

/**
 * The pure half of the metadata generator: it parses source text and builds the
 * catalogue objects, and it never writes a file or exits the process. The
 * entry point beside it (`generate-docs-metadata.ts`) owns both of those, so a
 * test can import everything here without a side effect.
 *
 * Parsing goes through `oxc-parser`, never a regular expression: an export list
 * scraped with a regex is wrong the first time a file writes `export {` across
 * two lines or exports a type. TypeScript's own compiler API is not an option —
 * TS 7 no longer ships one (`typescript`'s `.` export is `lib/version.cjs`).
 */

/**
 * Story titles follow the file name for every primitive but one, whose story is
 * named after the component it exports rather than the file it lives in. Kept
 * as an explicit table because the script cannot look the real title up:
 * `turbo prune --docker` drops `apps/storybook` from the build context, so the
 * stories directory does not exist where this runs. `test/generated/` is what
 * checks the ids against the real stories, in a checkout that has them.
 */
const STORYBOOK_DOCS_ID_OVERRIDES: Record<string, string> = {
  direction: "storybook-directionprovider",
};

export interface DocsSource {
  /** Path of the source directory, relative to the repo root. */
  directory: string;
  /** The only extension read out of it. */
  extension: string;
  /** npm package the files are published under. */
  packageName: string;
  /** Prefix every subpath carries (`components/` for the UI package). */
  subpathPrefix: string;
}

export const COMPONENT_SOURCE: DocsSource = {
  directory: "packages/ui/src/components",
  extension: ".tsx",
  packageName: UI_PACKAGE_NAME,
  subpathPrefix: UI_COMPONENT_SUBPATH_PREFIX,
};

export const HOOK_SOURCE: DocsSource = {
  directory: "packages/hook/src",
  extension: ".ts",
  packageName: HOOK_PACKAGE_NAME,
  subpathPrefix: HOOK_SUBPATH_PREFIX,
};

/** The two fields a single source file yields, before it is given a subpath. */
export interface ParsedModule {
  exports: string[];
  description: string | null;
}

// oxc-parser types its `program` through `@oxc-project/types`, which Bun does
// not hoist into a resolvable place — so the nodes are narrowed here to the
// three fields this file reads rather than trusted to resolve.
interface ProgramNode {
  type: string;
  start: number;
  end: number;
  declaration?: unknown;
}

interface SourceComment {
  type: string;
  value: string;
  start: number;
  end: number;
}

function isExportedDeclaration(node: ProgramNode): boolean {
  if (node.type === "ExportDefaultDeclaration") return true;

  return node.type === "ExportNamedDeclaration" && !!node.declaration;
}

/**
 * A JSDoc block sitting immediately above the first exported declaration, with
 * nothing but whitespace between the two. Anything further up documents an
 * import or an internal helper and is not this module's description.
 */
function extractDescription(
  source: string,
  comments: SourceComment[],
  body: ProgramNode[],
): string | null {
  const declaration = body.find(isExportedDeclaration);
  if (!declaration) return null;

  // Walked from the end so the *closest* block above the declaration wins.
  // `findLast` would say it better, but the app's lib target is ES2022.
  let jsDoc: SourceComment | undefined;

  for (let index = comments.length - 1; index >= 0; index -= 1) {
    const comment = comments[index];
    if (!comment) continue;

    if (
      comment.type === "Block" &&
      comment.value.startsWith("*") &&
      comment.end <= declaration.start &&
      source.slice(comment.end, declaration.start).trim() === ""
    ) {
      jsDoc = comment;
      break;
    }
  }

  if (!jsDoc) return null;

  const text = jsDoc.value
    .slice(1)
    .split("\n")
    .map((line: string) =>
      line
        .trim()
        .replace(/^\*+ ?/, "")
        .trim(),
    )
    .filter((line: string) => line.length > 0)
    .join(" ")
    .trim();

  return text.length > 0 ? text : null;
}

/**
 * Named value exports plus the module's JSDoc description.
 *
 * `export type` entries are dropped — `chart.tsx` exports a `ChartConfig` type
 * that the published README deliberately does not list, and a consumer reading
 * the export table wants the things they can actually call.
 */
export function parseDocsModule(
  fileName: string,
  source: string,
): ParsedModule {
  const result = parseSync(fileName, source);

  if (result.errors.length > 0) {
    const [first] = result.errors;
    throw new Error(
      `Failed to parse ${fileName}: ${first?.message ?? "unknown"}`,
    );
  }

  const names = new Set<string>();

  for (const statement of result.module.staticExports) {
    for (const entry of statement.entries) {
      if (entry.isType) continue;

      const name = entry.exportName.name;
      if (typeof name !== "string" || name === "default") continue;

      names.add(name);
    }
  }

  // localeCompare, not the default sort: the JSON is regenerated on every
  // `dev`/`build`/`typecheck`/`test`, so an unstable order would churn the
  // Turbo hash and every review diff.
  const exports = [...names].sort((left, right) => left.localeCompare(right));

  const description = extractDescription(
    source,
    result.comments as SourceComment[],
    result.program.body as ProgramNode[],
  );

  return { exports, description };
}

/**
 * Storybook derives a docs id by lower-casing the story title and collapsing
 * every run of non-alphanumeric characters into a dash. Every title in this
 * workspace is `Storybook/<ComponentName>`, so the id is the slug with its
 * dashes removed — except where the override table says otherwise.
 */
export function toStorybookDocsId(slug: string): string {
  return (
    STORYBOOK_DOCS_ID_OVERRIDES[slug] ?? `storybook-${slug.replaceAll("-", "")}`
  );
}

export function buildDocsEntry(
  source: DocsSource,
  fileName: string,
  contents: string,
): DocsEntry {
  const slug = fileName.slice(0, -source.extension.length);
  const subpath = `${source.subpathPrefix}${slug}`;
  const { exports, description } = parseDocsModule(fileName, contents);

  return {
    slug,
    subpath,
    importPath: `${source.packageName}/${subpath}`,
    exports,
    description,
  };
}

/** Reads one source directory and returns the catalogue written to JSON. */
export function buildCatalogue(
  source: DocsSource,
  directoryPath: string,
): DocsCatalogue {
  const fileNames = readdirSync(directoryPath)
    .filter((fileName) => fileName.endsWith(source.extension))
    .sort((left, right) => left.localeCompare(right));

  const items = fileNames.map((fileName) =>
    buildDocsEntry(
      source,
      fileName,
      readFileSync(join(directoryPath, fileName), "utf8"),
    ),
  );

  return {
    package: source.packageName,
    generatedFrom: source.directory,
    items,
  };
}

/** The component catalogue: every entry additionally carries its Storybook id. */
export function buildComponentCatalogue(
  repoRoot: string,
): DocsCatalogue<ComponentDocsEntry> {
  const catalogue = buildCatalogue(
    COMPONENT_SOURCE,
    join(repoRoot, COMPONENT_SOURCE.directory),
  );

  return {
    ...catalogue,
    items: catalogue.items.map((item) => ({
      ...item,
      storybookDocsId: toStorybookDocsId(item.slug),
    })),
  };
}

export function buildHookCatalogue(repoRoot: string): DocsCatalogue {
  return buildCatalogue(HOOK_SOURCE, join(repoRoot, HOOK_SOURCE.directory));
}
