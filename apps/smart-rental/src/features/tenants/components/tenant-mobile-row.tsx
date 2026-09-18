import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@monorepo/ui/components/item";

import type { TenantView } from "~/types/tenant";
import { TenantAvatar } from "~/components/avatar/tenant-avatar";
import { StatusBadge } from "~/components/badge/status-badge";
import {
  tenantOverdueInvoiceConfig,
  tenantStatusConfig,
} from "~/constants/status";
import TenantRowActions from "./tenant-row-actions";

/** A Người thuê table row's mobile substitute — `renderMobileRow` on `DataTable`. */
export default function TenantMobileRow({ tenant }: { tenant: TenantView }) {
  return (
    <Item variant="outline" size="sm">
      <ItemMedia>
        <TenantAvatar tenant={tenant} className="size-8 text-xs" />
      </ItemMedia>
      <ItemContent>
        <ItemTitle>{tenant.name}</ItemTitle>
        <ItemDescription>
          {tenant.room} · Tầng {tenant.floor}
        </ItemDescription>
      </ItemContent>
      <ItemActions>
        <StatusBadge config={tenantStatusConfig[tenant.status]} isCompact />
        {tenant.hasOverdueInvoice && (
          <StatusBadge config={tenantOverdueInvoiceConfig} isCompact />
        )}
        <TenantRowActions tenant={tenant} />
      </ItemActions>
    </Item>
  );
}
