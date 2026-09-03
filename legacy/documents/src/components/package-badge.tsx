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
        "border-border bg-background text-foreground inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
        className,
      )}
      data-testid="package-badge"
    >
      {label}
    </span>
  );
}
