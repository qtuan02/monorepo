import { Link } from "react-router";

import { cn } from "@monorepo/ui/libs/cn";

import type { ComponentMetadata } from "~/types/component-metadata";
import PackageBadge from "./package-badge";
import PreviewContainer from "./preview-container";

interface ComponentCardProps {
  component: ComponentMetadata;
}

export default function ComponentCard({ component }: ComponentCardProps) {
  return (
    <Link
      to={`/components/${component.id}`}
      className={cn(
        "group block rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-all duration-200 hover:border-black hover:shadow-md dark:border-gray-800 dark:bg-black dark:hover:border-white",
        "focus:ring-2 focus:ring-black focus:ring-offset-2 focus:outline-none dark:focus:ring-white",
      )}
      data-testid="component-card"
    >
      {/* Component preview */}
      <div className="mb-3 aspect-video w-full overflow-hidden rounded-md border border-gray-100 dark:border-gray-800">
        <PreviewContainer component={component} />
      </div>

      {/* Component name and package badge */}
      <div className="mb-1 flex items-start justify-between gap-2">
        <h3 className="text-lg font-semibold text-black group-hover:text-gray-700 dark:text-white dark:group-hover:text-gray-300">
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
