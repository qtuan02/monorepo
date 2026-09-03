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
        "group border-border bg-card hover:border-primary block rounded-lg border p-4 shadow-sm transition-all duration-200 hover:shadow-md",
        "focus:ring-ring focus:ring-2 focus:ring-offset-2 focus:outline-none",
      )}
      data-testid="component-card"
    >
      <div className="border-border mb-3 aspect-video w-full overflow-hidden rounded-md border">
        <PreviewContainer component={component} />
      </div>

      <div className="mb-1 flex items-start justify-between gap-2">
        <h3 className="text-foreground group-hover:text-muted-foreground text-lg font-semibold">
          {component.name}
        </h3>
        <PackageBadge package="ui" />
      </div>

      {component.description && (
        <p className="text-muted-foreground line-clamp-2 text-sm">
          {component.description}
        </p>
      )}
    </Link>
  );
}
