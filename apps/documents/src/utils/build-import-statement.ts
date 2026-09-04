/** Past this many names the one-line form stops being readable. */
const INLINE_EXPORT_LIMIT = 3;

/**
 * The exact line a consumer copies: named imports off the **published** subpath.
 *
 * The specifier is always an `@fe-monorepo/*` path, never the `@monorepo/*`
 * workspace name this app itself imports — a reader pasting the snippet has the
 * npm package installed, not the workspace.
 */
export function buildImportStatement(
  exports: readonly string[],
  importPath: string,
): string {
  if (exports.length === 0) return `import "${importPath}";`;

  if (exports.length <= INLINE_EXPORT_LIMIT) {
    return `import { ${exports.join(", ")} } from "${importPath}";`;
  }

  const names = exports.map((name) => `  ${name},`).join("\n");

  return `import {\n${names}\n} from "${importPath}";`;
}
