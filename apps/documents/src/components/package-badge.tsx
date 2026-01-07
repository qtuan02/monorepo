import { Badge } from "@monorepo/ui";
import { cn } from "@monorepo/ui/libs/cn";

interface PackageBadgeProps {
  package: "ui" | "hook";
  className?: string;
}

export default function PackageBadge({
  package: packageType,
  className,
}: PackageBadgeProps) {
  const label = packageType === "ui" ? "UI" : "Hook";

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-gray-300 bg-white px-2 py-0.5 text-xs font-medium text-black dark:border-gray-700 dark:bg-black dark:text-white",
        className,
      )}
      data-testid="package-badge"
    >
      {label}
    </span>
  );
}
