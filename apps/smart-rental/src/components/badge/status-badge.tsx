import { Badge } from "@monorepo/ui/components/badge";
import { cn } from "@monorepo/ui/utils/cn";

import type { StatusConfig } from "~/constants/status";

interface StatusBadgeProps {
  /** One entry of a config in `~/constants/status` — the caller indexes by status. */
  config: StatusConfig;
  /** Label only, no icon — for a dense cell. */
  isCompact?: boolean;
  className?: string;
}

/**
 * The one status badge (spec #127 folded the prototype's four into it): a
 * tone + label from the config, an icon when the config has one.
 */
export function StatusBadge({
  config,
  isCompact,
  className,
}: StatusBadgeProps) {
  const Icon = config.icon;

  return (
    <Badge variant="outline" className={cn(config.className, className)}>
      {Icon && !isCompact && <Icon />}
      {config.label}
    </Badge>
  );
}
