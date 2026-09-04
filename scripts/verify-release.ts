import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { mkdir, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import type { Shell } from "./lib/consumer-smoke.ts";
import {
  assertBuiltCss,
  assertInstalledShell,
  check,
  FORBIDDEN_IN_MANIFEST,
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
 * Consumer verification for the Publish shells (ADR-0004), run AFTER a release.
 *
 * `publish-smoke.ts` proves a tarball built from the working tree is usable;
 * this proves the thing npm actually serves is — which is not the same claim.
 * Between the two sit `changeset publish`, the registry's own packing, and
 * trusted publishing's provenance attestation, none of which the pre-release
 * smoke test can observe. It is the one-command form of the acceptance criteria
 * in ticket 05 of `.agents/plans/npm-publish/`:
 *
 *   1. `npm view <shell>@<version> --json` returns that exact version, carries
 *      `dist.attestations` (provenance — the visible proof the OIDC trusted
 *      publisher path ran, rather than someone's local `npm publish`), and
 *      declares only literal semver ranges: a `catalog:` or `workspace:`
 *      protocol on npm is a package nobody outside this repo can install.
 *   2. A throwaway Vite + React 19 project installs both shells **from the
 *      registry** and goes through the rest of the smoke test unchanged —
 *      subpath imports, the CSS entry with its `@source` line, `tsc --noEmit`,
 *      `vite build`.
 *
 * Run it with `bun run verify:release`. It reads the version to check from each
 * shell's own `package.json`, which after the "Version Packages" PR is merged
 * *is* the released version; pass `--version=2.0.0` to override both, or
 * `--keep` to leave the temporary project on disk.
 *
 * It only passes once that release exists on npm: run before one, `npm view`
 * answers E404 and the script exits non-zero, which is the correct answer.
 */

/** Reads one property off a value that may not be an object at all. */
function property(value: unknown, key: string): unknown {
  return value && typeof value === "object"
    ? Reflect.get(value, key)
    : undefined;
}

/** The version each shell is expected to be on npm, and where that came from. */
async function expectedVersion(shell: Shell): Promise<string> {
  const override = process.argv
    .find((argument) => argument.startsWith("--version="))
    ?.slice("--version=".length);
  if (override) {
    return override;
  }

  const manifest: unknown = JSON.parse(
    await readFile(join(repoRoot, shell.dir, "package.json"), "utf8"),
  );
  const version = property(manifest, "version");
  if (typeof version !== "string") {
    throw new Error(`${shell.dir}/package.json declares no version`);
  }
  return version;
}

/** `npm view <spec> --json`, or `undefined` when the registry has no such thing. */
function npmView(spec: string): unknown {
  const result = spawnSync("npm", shellSafe(["view", spec, "--json"]), {
    cwd: repoRoot,
    encoding: "utf8",
    shell: useShell,
  });

  if (result.status !== 0) {
    // npm prints its own diagnostics to stderr and a JSON error body to stdout;
    // show both, because "E404" and "ENEEDAUTH" are very different problems.
    console.error(`  npm view ${spec} exited with ${result.status}`);
    console.error(
      `  ${result.stderr.trim().split("\n").slice(0, 4).join("\n  ")}`,
    );
    return undefined;
  }

  return JSON.parse(result.stdout);
}

/**
 * Asserts on what the registry says about one published version. Returns false
 * when the version is missing outright, so the caller can stop before an
 * install that could only fail more confusingly.
 */
function assertPublishedMetadata(shell: Shell, version: string): boolean {
  const spec = `${shell.name}@${version}`;
  const meta = npmView(spec);

  if (meta === undefined) {
    check(false, `${spec} is on the registry`);
    return false;
  }
  check(true, `${spec} is on the registry`);

  check(
    property(meta, "version") === version,
    `${spec} reports version ${version}`,
  );

  // Provenance. Trusted publishing attaches this by itself; a package published
  // with a long-lived token has no `dist.attestations` at all, so its absence
  // means the release did not go the way ADR-0004 says it does.
  const attestations = property(property(meta, "dist"), "attestations");
  check(
    attestations !== undefined && attestations !== null,
    `${spec} carries dist.attestations (provenance)`,
  );
  const predicateType = property(
    property(attestations, "provenance"),
    "predicateType",
  );
  if (typeof predicateType === "string") {
    console.log(`      predicateType: ${predicateType}`);
  }

  // `catalog:` and `workspace:` are Bun workspace protocols. npm resolves
  // neither, so one reaching the registry is a package that installs nowhere.
  for (const field of ["dependencies", "peerDependencies"] as const) {
    const declared = JSON.stringify(property(meta, field) ?? {});
    for (const protocol of FORBIDDEN_IN_MANIFEST) {
      check(
        !declared.includes(protocol),
        `${spec} ${field} carries no \`${protocol}\` range`,
      );
    }
  }

  return true;
}

async function main(): Promise<void> {
  const keep = process.argv.includes("--keep");
  const versions = new Map<string, string>();
  for (const shell of SHELLS) {
    versions.set(shell.name, await expectedVersion(shell));
  }

  step("Read what the registry published");
  let metadataComplete = true;
  for (const shell of SHELLS) {
    const version = versions.get(shell.name) ?? "";
    metadataComplete =
      assertPublishedMetadata(shell, version) && metadataComplete;
  }

  if (!metadataComplete) {
    console.error(
      "\nA version above is not on npm, so the consumer install below could" +
        " only fail more confusingly. Stopping here.",
    );
    reportFailures("unreachable - metadata was incomplete");
    return;
  }

  const workspace = mkdtempSync(join(tmpdir(), "fe-monorepo-verify-release-"));
  const consumerRoot = join(workspace, "consumer");
  await mkdir(consumerRoot, { recursive: true });

  try {
    step("Scaffold a throwaway Vite + React 19 consumer");
    await scaffoldConsumer(consumerRoot);
    console.log(`  ${consumerRoot}`);

    step("Install both shells from the registry, the way a consumer would");
    run("bun", ["install"], consumerRoot);
    run(
      "bun",
      [
        "add",
        ...SHELLS.map((shell) => `${shell.name}@${versions.get(shell.name)}`),
      ],
      consumerRoot,
    );

    step("Assert nothing internal survived into the published files");
    for (const shell of SHELLS) {
      await assertInstalledShell(shell, consumerRoot, "the npm registry");
    }

    step("Typecheck and build the consumer");
    run("bunx", ["tsc", "--noEmit"], consumerRoot);
    run("bunx", ["vite", "build"], consumerRoot);

    step("Assert the shipped stylesheet reached the consumer's build");
    await assertBuiltCss(consumerRoot);
  } finally {
    if (keep) {
      console.log(`\nKept the verify workspace at ${workspace}`);
    } else {
      rmSync(workspace, { recursive: true, force: true });
    }
  }

  reportFailures("OK - published packages verified");
}

await main();
