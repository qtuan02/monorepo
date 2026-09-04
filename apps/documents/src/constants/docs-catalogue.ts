import type {
  ComponentDocsEntry,
  DocsCatalogue,
  DocsEntry,
} from "~/types/docs-catalogue";
import componentsJson from "~/generated/components.json";
import hooksJson from "~/generated/hooks.json";

/**
 * The two catalogues the whole site reads, imported at build time from the JSON
 * `scripts/generate-docs-metadata.ts` writes.
 *
 * This is static data, not server state: it is baked into the bundle, so it
 * needs no query hook, no `useMemo` wrapper and no loading branch. Bundling it
 * is also what makes the site update itself — run `ui-add`, and the next build
 * has the new primitive's page.
 *
 * The annotations below are the type check: if the generator's output shape
 * ever stops matching `~/types/docs-catalogue`, this file fails to compile.
 */
export const componentCatalogue: DocsCatalogue<ComponentDocsEntry> =
  componentsJson;

export const hookCatalogue: DocsCatalogue<DocsEntry> = hooksJson;

/** Slug → entry, so a detail route resolves in one lookup instead of a scan. */
const componentBySlug = new Map(
  componentCatalogue.items.map((item) => [item.slug, item]),
);

const hookBySlug = new Map(
  hookCatalogue.items.map((item) => [item.slug, item]),
);

export function findComponent(
  slug: string | undefined,
): ComponentDocsEntry | undefined {
  return slug ? componentBySlug.get(slug) : undefined;
}

export function findHook(slug: string | undefined): DocsEntry | undefined {
  return slug ? hookBySlug.get(slug) : undefined;
}
