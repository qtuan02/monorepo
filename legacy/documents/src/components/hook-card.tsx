import { Link } from "react-router";

import { cn } from "@monorepo/ui/libs/cn";

import type { HookMetadata } from "~/types/hook-metadata";
import PackageBadge from "./package-badge";

interface HookCardProps {
  hook: HookMetadata;
}

export default function HookCard({ hook }: HookCardProps) {
  const description =
    hook.description ||
    `A custom React hook for ${hook.name
      .replace(/^Use/, "")
      .replace(/([A-Z])/g, " $1")
      .trim()
      .toLowerCase()} functionality.`;

  return (
    <Link
      to={`/hooks/${hook.id}`}
      className={cn(
        "group border-border bg-card hover:border-primary block rounded-lg border p-4 shadow-sm transition-all duration-200 hover:shadow-md",
        "focus:ring-ring focus:ring-2 focus:ring-offset-2 focus:outline-none",
      )}
      data-testid="hook-card"
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <h3 className="text-foreground group-hover:text-muted-foreground truncate text-lg font-semibold">
          {hook.name}
        </h3>
        <PackageBadge package="hook" />
      </div>

      <p className="text-muted-foreground line-clamp-2 text-sm">
        {description}
      </p>
    </Link>
  );
}
