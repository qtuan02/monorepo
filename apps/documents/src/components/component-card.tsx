import { Link } from "react-router";

import { cn } from "@monorepo/ui/libs/cn";

import type { ComponentMetadata } from "~/types/component-metadata";
import { categoryToSlug } from "~/lib/category-utils";
import PackageBadge from "./package-badge";

interface ComponentCardProps {
  component: ComponentMetadata;
}

export default function ComponentCard({ component }: ComponentCardProps) {
  const categorySlug = categoryToSlug(component.category);

  return (
    <Link
      to={`/components/${categorySlug}/${component.id}`}
      className={cn(
        "group block rounded-lg border bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg dark:bg-gray-800",
        "focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 focus:outline-none dark:focus:ring-gray-100",
      )}
      data-testid="component-card"
    >
      {/* Thumbnail placeholder */}
      <div className="mb-3 aspect-video w-full rounded-md bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800">
        <div className="flex h-full flex-col items-center justify-center gap-2 text-sm">
          <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
            Preview Coming Soon
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Component preview
          </span>
        </div>
      </div>

      {/* Component name and package badge */}
      <div className="mb-1 flex items-start justify-between gap-2">
        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-gray-700 dark:text-gray-100 dark:group-hover:text-gray-300">
          {component.name}
        </h3>
        <PackageBadge package="ui" />
      </div>

      {/* Description */}
      {component.description && (
        <p className="line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
          {component.description}
        </p>
      )}
    </Link>
  );
}
