import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import {
  buildComponentCatalogue,
  buildHookCatalogue,
} from "./docs-metadata.ts";

/**
 * Writes `src/generated/{components,hooks}.json` from the two workspace source
 * directories. Run from `predev` / `prebuild` / `pretypecheck` / `pretest` —
 * all four, because Turbo's `typecheck` and `test` tasks do not depend on this
 * package's own `build`, so on a clean checkout they would otherwise run before
 * the JSON exists and fail to resolve the import.
 *
 * `src/generated/` is gitignored: the catalogue is derived data, and committing
 * it would let it drift from `packages/ui` the first time someone runs
 * `ui-add` without running this.
 */
const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const appRoot = resolve(scriptDirectory, "..");
const repoRoot = resolve(appRoot, "../..");
const outputDirectory = join(appRoot, "src", "generated");

function writeCatalogue(fileName: string, catalogue: unknown): void {
  // The trailing newline keeps the file POSIX-shaped; the two-space indent is
  // what Biome would write, though it never sees this directory (it honours
  // .gitignore, and `src/generated/` is ignored).
  writeFileSync(
    join(outputDirectory, fileName),
    `${JSON.stringify(catalogue, null, 2)}\n`,
    "utf8",
  );
}

mkdirSync(outputDirectory, { recursive: true });

const components = buildComponentCatalogue(repoRoot);
const hooks = buildHookCatalogue(repoRoot);

writeCatalogue("components.json", components);
writeCatalogue("hooks.json", hooks);

console.info(
  `generate-docs-metadata: ${components.items.length} components, ${hooks.items.length} hooks → src/generated/`,
);
