import { useState } from "react";
import { ExternalLink } from "lucide-react";

import { Button } from "@monorepo/ui/components/button";
import { Separator } from "@monorepo/ui/components/separator";

import type { ResidenceDeclaration } from "~/types/compliance";
import { TenantAvatar } from "~/components/avatar/tenant-avatar";
import { StatusBadge } from "~/components/badge/status-badge";
import { ResidenceNotificationSentSheet } from "~/components/sheet/residence-notification-sent-sheet";
import { ResidenceRegistrationExtendSheet } from "~/components/sheet/residence-registration-extend-sheet";
import {
  complianceStatusConfig,
  residenceNotificationStatusConfig,
} from "~/constants/status";
import { formatDate } from "~/utils/date";

// Giữ nguyên link hiện tại (ticket #188) — chưa xác minh đây có đúng là cổng
// dịch vụ công cho Thông báo lưu trú / Đăng ký tạm trú hay không.
const PUBLIC_SERVICE_PORTAL_URL = "https://dichvucong.gov.vn";

interface ResidenceDeclarationLinesProps {
  declaration: ResidenceDeclaration;
  /** The caller's own header already shows the tenant's name — the tenant detail's Lưu trú tab. */
  hideTenantHeader?: boolean;
}

/**
 * The "hai dòng" every Người thuê with a live Hợp đồng carries (spec #153
 * §10 row 8): Thông báo lưu trú (chưa gửi/đã gửi qua sheet hỏi mã hồ sơ +
 * ngày) and Đăng ký tạm trú (trạng thái suy từ hạn + hành động "Đã gia hạn
 * đến …"), plus the link out to the public portal. Owns both sheets and
 * their mutations itself (ticket #188) — the two call sites (`/compliance`
 * and a tenant's own "Lưu trú" tab) only pass the declaration.
 */
export function ResidenceDeclarationLines({
  declaration,
  hideTenantHeader,
}: ResidenceDeclarationLinesProps) {
  const [isSentSheetOpen, setIsSentSheetOpen] = useState(false);
  const [isExtendSheetOpen, setIsExtendSheetOpen] = useState(false);

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
                ? `Đã gửi ${formatDate(declaration.notificationDate ?? "")} · ${declaration.referenceNumber}`
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
                onClick={() => setIsSentSheetOpen(true)}
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
              Hết hạn {formatDate(declaration.registrationDueDate)}
              {declaration.registrationExpiringSoon && " · sắp hết hạn"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge
              config={complianceStatusConfig[declaration.registrationStatus]}
            />
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setIsExtendSheetOpen(true)}
            >
              Đã gia hạn đến …
            </Button>
          </div>
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

      <ResidenceNotificationSentSheet
        open={isSentSheetOpen}
        onOpenChange={setIsSentSheetOpen}
        tenantId={declaration.tenantId}
        tenantName={declaration.tenantName}
      />
      <ResidenceRegistrationExtendSheet
        open={isExtendSheetOpen}
        onOpenChange={setIsExtendSheetOpen}
        tenantId={declaration.tenantId}
        tenantName={declaration.tenantName}
      />
    </div>
  );
}
