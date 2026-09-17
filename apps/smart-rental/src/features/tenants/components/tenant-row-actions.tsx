import { CreditCard, UserCircle } from "lucide-react";

import type { Tenant } from "~/types/tenant";
import { EntityActionMenu } from "~/components/menu/entity-action-menu";
import { ROUTES } from "~/constants/routes";

interface TenantRowActionsProps {
  tenant: Tenant;
  side?: "top" | "bottom";
}

/** The "⋯" of a Người thuê row or card. "Tạo hóa đơn" has no flow yet, as in the prototype. */
export default function TenantRowActions({
  tenant,
  side = "bottom",
}: TenantRowActionsProps) {
  return (
    <EntityActionMenu
      side={side}
      items={[
        {
          key: "detail",
          label: "Xem chi tiết",
          icon: <UserCircle />,
          link: ROUTES.tenantDetailPath(tenant.id),
        },
        { key: "invoice", label: "Tạo hóa đơn", icon: <CreditCard /> },
      ]}
    />
  );
}
