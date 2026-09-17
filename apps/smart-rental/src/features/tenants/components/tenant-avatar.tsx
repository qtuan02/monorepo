import { cn } from "@monorepo/ui/utils/cn";

import type { Tenant } from "~/types/tenant";
import { getInitials } from "~/utils/string";

interface TenantAvatarProps {
  tenant: Pick<Tenant, "name">;
  className?: string;
}

/** The initials tile a Người thuê wears on every screen — one tone (ADR-0011). */
export default function TenantAvatar({ tenant, className }: TenantAvatarProps) {
  return (
    <div
      aria-hidden
      className={cn(
        "bg-primary text-primary-foreground flex size-11 shrink-0 items-center justify-center rounded-full text-sm font-bold shadow-sm",
        className,
      )}
    >
      {getInitials(tenant.name)}
    </div>
  );
}
