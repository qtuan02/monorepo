import { cn } from "@monorepo/ui/utils/cn";

import type { PeerDependency } from "~/constants/packages";

interface PeerDependencyListProps {
  packageName: string;
  peers: readonly PeerDependency[];
}

/** One aurora stop per chip, in peer order — decoration, not meaning. */
const dotClassNames = [
  "bg-(--aurora-indigo)",
  "bg-(--aurora-cyan)",
  "bg-(--aurora-pink)",
  "bg-(--aurora-amber)",
] as const;

/**
 * One package's peers as chips (brief §2c) — the versions a consumer installs
 * themselves. A list rather than the two-column table this replaced: each
 * entry is one name and one range, and there is nothing across rows to line
 * up.
 */
export default function PeerDependencyList({
  packageName,
  peers,
}: PeerDependencyListProps) {
  return (
    <div>
      <h3 className="text-muted-foreground mb-2 font-mono text-xs">
        {packageName}
      </h3>
      <ul className="flex flex-wrap gap-2">
        {peers.map((peer, index) => (
          // A peer's name is unique within its package — the stable key.
          <li
            key={peer.name}
            className="bg-card border-primary/15 inline-flex items-center gap-2 rounded-full border py-1.5 pr-3 pl-2 font-mono text-[13px] shadow-(--sh-2)"
          >
            <span
              aria-hidden="true"
              className={cn(
                "size-4 rounded-full",
                dotClassNames[index % dotClassNames.length],
              )}
            />
            {peer.name} {peer.range}
          </li>
        ))}
      </ul>
    </div>
  );
}
