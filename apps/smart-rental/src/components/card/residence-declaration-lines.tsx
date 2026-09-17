import { ExternalLink } from "lucide-react";

import { Button } from "@monorepo/ui/components/button";
import { Separator } from "@monorepo/ui/components/separator";

import type { ResidenceDeclaration } from "~/types/compliance";
import { TenantAvatar } from "~/components/avatar/tenant-avatar";
import { StatusBadge } from "~/components/badge/status-badge";
import {
  complianceStatusConfig,
  residenceNotificationStatusConfig,
} from "~/constants/status";

const PUBLIC_SERVICE_PORTAL_URL = "https://dichvucong.gov.vn";

interface ResidenceDeclarationLinesProps {
  declaration: ResidenceDeclaration;
  onMarkSent: () => void;
  isMarking?: boolean;
  /** The caller's own header already shows the tenant's name — the tenant detail's Lưu trú tab. */
  hideTenantHeader?: boolean;
}

/**
 * The "hai dòng" every Người thuê with a live Hợp đồng carries (spec #153
 * §10 row 8): Thông báo lưu trú (chưa gửi/đã gửi + nút ghi tay) and Đăng ký
 * tạm trú (trạng thái + hạn), plus the link out to the public portal. Shared
 * by `/compliance` (one card per tenant) and a tenant's own "Lưu trú" tab.
 */
export function ResidenceDeclarationLines({
  declaration,
  onMarkSent,
  isMarking,
  hideTenantHeader,
}: ResidenceDeclarationLinesProps) {
  return (
    <div data-slot="residence-declaration-row" className="space-y-4">
      {!hideTenantHeader && (
        <div className="flex items-center gap-3">
          <TenantAvatar tenant={{ name: declaration.tenantName }} />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">
              {declaration.tenantName}
            </p>
            <p className="text-muted-foreground text-xs">{declaration.room}</p>
          </div>
        </div>
      )}

      <div className="space-y-3 text-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="font-medium">Thông báo lưu trú</p>
            <p className="text-muted-foreground text-xs">
              {declaration.notificationStatus === "sent"
                ? `Đã gửi ${declaration.notificationDate} · ${declaration.referenceNumber}`
                : "Chưa gửi cho công an cấp xã"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge
              config={
                residenceNotificationStatusConfig[
                  declaration.notificationStatus
                ]
              }
            />
            {declaration.notificationStatus === "not_sent" && (
              <Button
                type="button"
                size="sm"
                disabled={isMarking}
                onClick={onMarkSent}
              >
                Đã gửi
              </Button>
            )}
          </div>
        </div>

        <Separator />

        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="font-medium">Đăng ký tạm trú</p>
            <p className="text-muted-foreground text-xs">
              Hết hạn {declaration.registrationDueDate}
              {declaration.registrationExpiringSoon && " · sắp hết hạn"}
            </p>
          </div>
          <StatusBadge
            config={complianceStatusConfig[declaration.registrationStatus]}
          />
        </div>
      </div>

      <a
        href={PUBLIC_SERVICE_PORTAL_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="text-primary inline-flex items-center gap-1.5 text-xs underline underline-offset-4"
      >
        <ExternalLink className="size-3" />
        Cổng dịch vụ công
      </a>
    </div>
  );
}
