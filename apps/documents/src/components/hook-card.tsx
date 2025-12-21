import { Link } from "react-router";
import { Badge } from "@monorepo/ui";
import { cn } from "@monorepo/ui/libs/cn";

import type { HookMetadata } from "~/types/hook-metadata";
import { hookCategoryToSlug } from "~/lib/hook-category-utils";
import PackageBadge from "./package-badge";

interface HookCardProps {
  hook: HookMetadata;
}

export default function HookCard({ hook }: HookCardProps) {
  const categorySlug = hookCategoryToSlug(hook.category);

  return (
    <Link
      to={`/hooks/${categorySlug}/${hook.id}`}
      className={cn(
        "group block rounded-lg border bg-white p-4 shadow-sm transition-all hover:shadow-md dark:bg-gray-800",
        "focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 dark:focus:ring-gray-100",
      )}
      data-testid="hook-card"
    >
      {/* Hook name, category badge, and package badge */}
      <div className="mb-2 flex items-start justify-between gap-2">
        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-gray-700 dark:text-gray-100 dark:group-hover:text-gray-300">
          {hook.name}
        </h3>
        <div className="flex shrink-0 gap-1">
          <Badge variant="secondary" className="text-xs">
            {hook.category}
          </Badge>
          <PackageBadge package="hook" />
        </div>
      </div>

      {/* Description */}
      {hook.description && (
        <p className="text-sm text-gray-600 line-clamp-2 dark:text-gray-400">
          {hook.description}
        </p>
      )}
    </Link>
  );
}

