import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import type { Shell } from "./lib/consumer-smoke.ts";
import {
  assertBuiltCss,
  assertInstalledShell,
  repoRoot,
  reportFailures,
  run,
  SHELLS,
  scaffoldConsumer,
  shellSafe,
  step,
  useShell,
} from "./lib/consumer-smoke.ts";

/**
 * Consumer smoke test for the Publish shells (ADR-0004), run BEFORE a release.
 *
 * The Gate proves the source builds; this proves the *tarball* is usable. It
 * packs each shell with `npm pack` — the same tool `changeset publish` shells
 * out to — installs the tarballs into a throwaway Vite + React 19 project
 * outside the workspace, and typechecks and builds it the way a consumer would.
 * Anything that only works because a file sits inside this monorepo — a
 * `catalog:` range npm cannot resolve, an internal `@monorepo/*` specifier, a
 * subpath missing from `exports` — fails here rather than on npm.
 *
 * Run it with `bun run publish:smoke`; pass `--keep` to leave the temporary
 * project on disk and print its path. Its after-the-fact twin, which runs the
 * same consumer against what npm actually serves, is
 * [`verify-release.ts`](./verify-release.ts).
 */

/**
 * The upstream license of the hooks Derived from hooks-ts (ADR-0010). Both
 * shells carry a copy — `@fe-monorepo/ui` vendors one such hook into
 * `dist/internal/` — and only a shell's `files` field decides whether it is
 * packed, so the tarball's own entry list is what gets checked.
 */
const THIRD_PARTY_LICENSE = "LICENSE-hooks-ts";

/**
 * Packs one shell and returns the tarball path `npm pack` reported, after
 * asserting the tarball carries `LICENSE-hooks-ts`.
 */
function pack(shell: Shell, destination: string): string {
  const result = spawnSync(
    "npm",
    shellSafe(["pack", "--json", "--pack-destination", destination]),
    {
      cwd: join(repoRoot, shell.dir),
      encoding: "utf8",
      shell: useShell,
    },
  );

  if (result.status !== 0) {
    throw new Error(`npm pack failed for ${shell.name}:\n${result.stderr}`);
  }

  // `npm pack --json` reports one entry per packed package; taking the filename
  // it names rather than globbing the directory keeps two shells apart.
  const packed: unknown = JSON.parse(result.stdout);
  const first: unknown = Array.isArray(packed) ? packed[0] : undefined;
  if (!first || typeof first !== "object") {
    throw new Error(`npm pack reported nothing for ${shell.name}`);
  }

  const filename: unknown = Reflect.get(first, "filename");
  if (typeof filename !== "string") {
    throw new Error(`npm pack reported no filename for ${shell.name}`);
  }

  // `files` here is the packed entry list — `[{ path, size, mode }]` — not the
  // `files` field of package.json, which is exactly the point.
  const entries: unknown = Reflect.get(first, "files");
  const packedLicense =
    Array.isArray(entries) &&
    entries.some(
      (entry: unknown) =>
        entry &&
        typeof entry === "object" &&
        Reflect.get(entry, "path") === THIRD_PARTY_LICENSE,
    );

  if (!packedLicense) {
    throw new Error(
      `${shell.name} tarball lacks ${THIRD_PARTY_LICENSE} — list it in \`files\` of ${shell.dir}/package.json`,
    );
  }

  return join(destination, filename);
}

async function main(): Promise<void> {
  const keep = process.argv.includes("--keep");
  const workspace = mkdtempSync(join(tmpdir(), "fe-monorepo-publish-smoke-"));
  const tarballDir = join(workspace, "tarballs");
  const consumerRoot = join(workspace, "consumer");
  await mkdir(tarballDir, { recursive: true });
  await mkdir(consumerRoot, { recursive: true });

  try {
    step("Build each shell's dist/ from its source package");
    run(
      "bun",
      [
        "run",
        "build",
        ...SHELLS.flatMap((shell) => ["--filter", shell.source]),
      ],
      repoRoot,
    );

    step("Pack each shell with npm pack");
    const tarballs = SHELLS.map((shell) => {
      const tarball = pack(shell, tarballDir);
      console.log(`  ${shell.name} -> ${tarball}`);
      return tarball;
    });

    step("Scaffold a throwaway Vite + React 19 consumer");
    await scaffoldConsumer(consumerRoot);
    console.log(`  ${consumerRoot}`);

    step("Install the tarballs the way a consumer would");
    run("bun", ["install"], consumerRoot);
    run("bun", ["add", ...tarballs], consumerRoot);

    step("Assert nothing internal survived into the published files");
    for (const shell of SHELLS) {
      await assertInstalledShell(shell, consumerRoot);
    }

    step("Typecheck and build the consumer");
    run("bunx", ["tsc", "--noEmit"], consumerRoot);
    run("bunx", ["vite", "build"], consumerRoot);

    step("Assert the shipped stylesheet reached the consumer's build");
    await assertBuiltCss(consumerRoot);
  } finally {
    if (keep) {
      console.log(`\nKept the smoke workspace at ${workspace}`);
    } else {
      rmSync(workspace, { recursive: true, force: true });
    }
  }

  reportFailures("OK - publish smoke test passed");
}

await main();
