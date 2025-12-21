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
        "group block rounded-lg border bg-white p-4 shadow-sm transition-all hover:shadow-md dark:bg-gray-800",
        "focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 dark:focus:ring-gray-100",
      )}
      data-testid="component-card"
    >
      {/* Thumbnail placeholder */}
      <div className="mb-3 aspect-video w-full rounded-md bg-gray-100 dark:bg-gray-700">
        <div className="flex h-full items-center justify-center text-sm text-gray-400">
          Preview
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
        <p className="text-sm text-gray-600 line-clamp-2 dark:text-gray-400">
          {component.description}
        </p>
      )}
    </Link>
  );
}

