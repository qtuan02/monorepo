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

/** Packs one shell and returns the tarball path `npm pack` reported. */
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
  const first = Array.isArray(packed) ? packed[0] : undefined;
  const filename: unknown =
    first && typeof first === "object"
      ? Reflect.get(first, "filename")
      : undefined;

  if (typeof filename !== "string") {
    throw new Error(`npm pack reported no filename for ${shell.name}`);
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
