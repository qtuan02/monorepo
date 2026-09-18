import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

import { PEER_DEPENDENCIES } from "~/constants/packages";

/**
 * `PEER_DEPENDENCIES` is copied by value from the two Publish shells, because a
 * browser bundle cannot read their `package.json` at runtime. This is what
 * holds the copy equal: bump a peer range in a shell without touching the
 * constant and the Getting Started page would keep telling consumers the old
 * one. Vitest's cwd is the app root, so the repo root is two levels up.
 */
const repoRoot = resolve(process.cwd(), "../..");

function shellPeers(shell: string): Record<string, string> {
  const pkg = JSON.parse(
    readFileSync(resolve(repoRoot, "packages", shell, "package.json"), "utf8"),
  ) as { peerDependencies: Record<string, string> };

  return pkg.peerDependencies;
}

describe("PEER_DEPENDENCIES", () => {
  it.each([
    ["ui", "ui-public"],
    ["hook", "hook-public"],
  ] as const)("matches the %s shell's peerDependencies", (key, shell) => {
    const copied = Object.fromEntries(
      PEER_DEPENDENCIES[key].map((peer) => [peer.name, peer.range]),
    );

    expect(copied).toEqual(shellPeers(shell));
  });
});
