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
  const variant = packageType === "ui" ? "default" : "secondary";

  return (
    <Badge
      variant={variant}
      className={cn("text-xs", className)}
      data-testid="package-badge"
    >
      {label}
    </Badge>
  );
}

