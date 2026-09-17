import { cn } from "@monorepo/ui/utils/cn";

import type { Tenant } from "~/types/tenant";
import { getInitials } from "~/utils/string";

interface TenantAvatarProps {
  tenant: Pick<Tenant, "name" | "avatarColor">;
  className?: string;
}

/** The coloured initials tile a Người thuê wears on every screen. */
export default function TenantAvatar({ tenant, className }: TenantAvatarProps) {
  return (
    <div
      aria-hidden
      className={cn(
        "flex size-11 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white shadow-sm",
        tenant.avatarColor,
        className,
      )}
    >
      {getInitials(tenant.name)}
    </div>
  );
}
