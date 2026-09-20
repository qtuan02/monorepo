import { Calendar, DoorOpen, Mail, Phone } from "lucide-react";

import { CardContent, CardHeader } from "@monorepo/ui/components/card";

import type { TenantView } from "~/types/tenant";
import { TenantAvatar } from "~/components/avatar/tenant-avatar";
import { StatusBadge } from "~/components/badge/status-badge";
import { EntityListCard } from "~/components/card/entity-list-card";
import { StatItem } from "~/components/card/stat-item";
import {
  tenantOverdueInvoiceConfig,
  tenantStatusConfig,
} from "~/constants/status";
import { formatCurrency } from "~/utils/currency";
import { formatOptionalDate } from "~/utils/date";
import TenantRowActions from "./tenant-row-actions";

interface TenantCardProps {
  tenant: TenantView;
}

/** One tile of the Người thuê card view. */
export default function TenantCard({ tenant }: TenantCardProps) {
  return (
    <EntityListCard
      header={
        <CardHeader className="flex flex-row items-start justify-between gap-2">
          <div className="flex min-w-0 items-center gap-3">
            <TenantAvatar tenant={tenant} />
            <div className="min-w-0">
              <h3 className="truncate text-sm leading-tight font-semibold">
                {tenant.name}
              </h3>
              <p className="text-muted-foreground mt-0.5 flex items-center gap-1.5 text-xs">
                <DoorOpen className="size-3 shrink-0" />
                <span>{tenant.room}</span>
                <span className="text-border">•</span>
                <span>Tầng {tenant.floor}</span>
              </p>
            </div>
          </div>
          <div className="relative z-10 shrink-0">
            <TenantRowActions tenant={tenant} side="top" />
          </div>
        </CardHeader>
      }
      content={
        <CardContent className="space-y-3 pt-3">
          <div className="flex flex-wrap gap-2">
            <StatusBadge config={tenantStatusConfig[tenant.status]} />
            {tenant.hasOverdueInvoice && (
              <StatusBadge config={tenantOverdueInvoiceConfig} isCompact />
            )}
          </div>
          <div className="text-muted-foreground space-y-1.5 text-xs">
            <p className="flex items-center gap-2">
              <Phone className="size-3 shrink-0 opacity-70" />
              <span className="truncate">{tenant.phone}</span>
            </p>
            <p className="flex items-center gap-2">
              <Mail className="size-3 shrink-0 opacity-70" />
              <span className="truncate">{tenant.email}</span>
            </p>
          </div>
          <dl className="bg-muted/50 grid grid-cols-2 gap-2 rounded-lg p-2.5">
            <StatItem
              label="Tiền thuê"
              value={formatCurrency(tenant.rentAmount)}
              valueClassName="text-sm tabular-nums"
            />
            <StatItem
              label="Tiền cọc"
              value={formatCurrency(tenant.depositAmount)}
              valueClassName="text-sm tabular-nums"
            />
          </dl>
          <div className="text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
            <span className="flex items-center gap-1.5">
              <Calendar className="size-3" />
              Vào: {formatOptionalDate(tenant.moveInDate)}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="size-3" />
              HĐ: {formatOptionalDate(tenant.contractEnd)}
            </span>
          </div>
        </CardContent>
      }
    />
  );
}
