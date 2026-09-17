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

/**
 * The story a detail page embeds as its example. Every stories file exports a
 * `Default` story except the one listed here, whose two stories are named for
 * the accordion's two modes instead. Same reason as the table above for being
 * a table: the stories are not on disk where this runs.
 */
const STORYBOOK_EXAMPLE_STORY_OVERRIDES: Record<string, string> = {
  accordion: "single",
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

/** The fields a single source file yields, before it is given a subpath. */
export interface ParsedModule {
  exports: string[];
  description: string | null;
  example: string | null;
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
 * The JSDoc block sitting immediately above an exported declaration, with
 * nothing but whitespace between the two. Anything further up documents an
 * import or an internal helper and is not this module's block.
 */
function jsDocAbove(
  source: string,
  comments: SourceComment[],
  declaration: ProgramNode,
): SourceComment | undefined {
  // Walked from the end so the *closest* block above the declaration wins.
  // `findLast` would say it better, but the app's lib target is ES2022.
  for (let index = comments.length - 1; index >= 0; index -= 1) {
    const comment = comments[index];
    if (!comment) continue;

    if (
      comment.type === "Block" &&
      comment.value.startsWith("*") &&
      comment.end <= declaration.start &&
      source.slice(comment.end, declaration.start).trim() === ""
    ) {
      return comment;
    }
  }

  return undefined;
}

function isTagLine(line: string): boolean {
  return line.trimStart().startsWith("@");
}

/** Drops the blank lines the `@example` line and the block's closing line leave around an example. */
function trimBlankEdges(lines: string[]): string[] {
  const start = lines.findIndex((line) => line.trim().length > 0);
  if (start === -1) return [];

  let end = lines.length;
  while (end > start && lines[end - 1]?.trim().length === 0) end -= 1;

  return lines.slice(start, end);
}

/**
 * The description and the `@example` of the first exported declaration that
 * carries a JSDoc block — the *first with one*, not the first export, because
 * `use-is-mobile` exports its breakpoint constant ahead of the hook the block
 * describes.
 *
 * The description is every line before the first `@tag`, joined into one
 * sentence. The example is every line after `@example` (or the rest of that
 * same line) up to the next tag, kept line for line with its indent, so a
 * snippet renders exactly as the source wrote it.
 */
function extractJsDoc(
  source: string,
  comments: SourceComment[],
  body: ProgramNode[],
): Omit<ParsedModule, "exports"> {
  let jsDoc: SourceComment | undefined;

  for (const node of body) {
    if (!isExportedDeclaration(node)) continue;
    jsDoc = jsDocAbove(source, comments, node);
    if (jsDoc) break;
  }

  if (!jsDoc) return { description: null, example: null };

  // Only the `*` gutter goes, never the indent after it — an example's code
  // keeps its nesting.
  const lines = jsDoc.value
    .slice(1)
    .split("\n")
    .map((line: string) => line.replace(/^\s*\*+ ?/, "").trimEnd());

  const firstTag = lines.findIndex(isTagLine);
  const description = (firstTag === -1 ? lines : lines.slice(0, firstTag))
    .map((line: string) => line.trim())
    .filter((line: string) => line.length > 0)
    .join(" ");

  const exampleTag = lines.findIndex((line) =>
    line.trimStart().startsWith("@example"),
  );
  let example: string | null = null;

  if (exampleTag !== -1) {
    const inline = lines[exampleTag]?.trimStart().slice("@example".length);
    const rest = lines.slice(exampleTag + 1);
    const nextTag = rest.findIndex(isTagLine);
    const exampleLines = trimBlankEdges([
      inline?.trim() ?? "",
      ...(nextTag === -1 ? rest : rest.slice(0, nextTag)),
    ]);

    example = exampleLines.length > 0 ? exampleLines.join("\n") : null;
  }

  return { description: description.length > 0 ? description : null, example };
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

  const { description, example } = extractJsDoc(
    source,
    result.comments as SourceComment[],
    result.program.body as ProgramNode[],
  );

  return { exports, description, example };
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

/**
 * A story id is the docs id plus the story's export name, lower-cased with
 * dashes between words — `storybook-button--default`. It is what
 * `iframe.html?id=…&viewMode=story` renders on its own, with no Storybook
 * chrome around it.
 */
export function toStorybookExampleId(slug: string): string {
  const story = STORYBOOK_EXAMPLE_STORY_OVERRIDES[slug] ?? "default";

  return `${toStorybookDocsId(slug)}--${story}`;
}

export function buildDocsEntry(
  source: DocsSource,
  fileName: string,
  contents: string,
): DocsEntry {
  const slug = fileName.slice(0, -source.extension.length);
  const subpath = `${source.subpathPrefix}${slug}`;
  const { exports, description, example } = parseDocsModule(fileName, contents);

  return {
    slug,
    subpath,
    importPath: `${source.packageName}/${subpath}`,
    exports,
    description,
    example,
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
      storybookExampleId: toStorybookExampleId(item.slug),
    })),
  };
}

export function buildHookCatalogue(repoRoot: string): DocsCatalogue {
  return buildCatalogue(HOOK_SOURCE, join(repoRoot, HOOK_SOURCE.directory));
}
