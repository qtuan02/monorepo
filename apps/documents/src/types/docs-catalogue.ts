/**
 * The shape `scripts/generate-docs-metadata.ts` writes into `src/generated/`
 * and the app reads back through `~/constants/docs-catalogue`.
 *
 * Deliberately small. There is no `props`, `parameters`, `returns` or
 * `category` here: a parser reads exports, not types, and the legacy site's
 * tables for those were hand-written data with no source of truth. What a
 * primitive's props actually are is answered by Storybook's docs page, which
 * every component entry links to.
 */
export interface DocsEntry {
  /** File name without its extension — also the published subpath's last segment. */
  slug: string;
  /** The subpath as it appears after the package name (`components/button`). */
  subpath: string;
  /** The full specifier a consumer writes (`@fe-monorepo/ui/components/button`). */
  importPath: string;
  /** Named value exports, sorted, with `export type` entries removed. */
  exports: string[];
  /** The leading JSDoc block of the first exported declaration, if the file has one. */
  description: string | null;
}

/** A component entry always carries the id of its Storybook docs page. */
export interface ComponentDocsEntry extends DocsEntry {
  storybookDocsId: string;
}

export interface DocsCatalogue<TEntry extends DocsEntry = DocsEntry> {
  /** The npm package name a consumer installs. */
  package: string;
  /** The workspace directory the entries were read from, for the README to quote. */
  generatedFrom: string;
  items: TEntry[];
}
