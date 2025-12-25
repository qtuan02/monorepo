import { Link } from "react-router";

import { cn } from "@monorepo/ui/libs/cn";

import type { HookMetadata } from "~/types/hook-metadata";
import PackageBadge from "./package-badge";

interface HookCardProps {
  hook: HookMetadata;
}

export default function HookCard({ hook }: HookCardProps) {
  // Provide fallback description if none exists
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
        "group block rounded-lg border bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg dark:bg-gray-800",
        "focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 focus:outline-none dark:focus:ring-gray-100",
      )}
      data-testid="hook-card"
    >
      {/* Hook name and package badge */}
      <div className="mb-2 flex items-start justify-between gap-2">
        <h3 className="truncate text-lg font-semibold text-gray-900 group-hover:text-gray-700 dark:text-gray-100 dark:group-hover:text-gray-300">
          {hook.name}
        </h3>
        <PackageBadge package="hook" />
      </div>

      {/* Description */}
      <p className="line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
        {description}
      </p>
    </Link>
  );
}
