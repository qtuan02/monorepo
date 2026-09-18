import dayjs from "@monorepo/dayjs";
import { DATE_FORMAT } from "@monorepo/dayjs/formats";

import type { ResidenceDeclaration } from "~/types/compliance";
import type { World } from "~/types/world";
import { isContractLive } from "~/utils/contract-status";

/** "Sắp hết hạn" cho Đăng ký tạm trú (ticket #161) — same window as a Hợp đồng. */
export const RESIDENCE_REGISTRATION_EXPIRING_WINDOW_DAYS = 30;

/**
 * Mỗi Người thuê có Hợp đồng hiệu lực → một dòng, hai nghĩa vụ (spec #153
 * §10 row 8, ticket #161): Thông báo lưu trú (chưa gửi / đã gửi, đọc từ
 * `ComplianceItem.status`) và Đăng ký tạm trú (trạng thái suy thuần từ hạn,
 * ticket #188 — chưa từng đọc `status` của item này). Không lưu — suy từ
 * Hợp đồng + `ComplianceItem` mỗi lần đọc (ADR-0012). Takes a World-shaped
 * bag (ADR-0015 §1) rather than four positional arrays — `buildWorld` calls
 * this with its own not-yet-complete object (already carrying `tenants`,
 * `contracts`, `complianceItems`, `today`), and every other caller passes a
 * real `World` from `readWorld`, which satisfies the same shape.
 */
export function buildResidenceDeclarations({
  tenants,
  contracts,
  complianceItems,
  today,
}: Pick<
  World,
  "tenants" | "contracts" | "complianceItems" | "today"
>): ResidenceDeclaration[] {
  const liveTenantIds = new Set(
    contracts
      .filter((contract) => isContractLive(contract, today))
      .map((contract) => contract.tenantId),
  );

  return tenants
    .filter((tenant) => liveTenantIds.has(tenant.id))
    .map((tenant) => {
      const notification = complianceItems.find(
        (item) =>
          item.tenantId === tenant.id && item.type === "residence_notification",
      );
      const registration = complianceItems.find(
        (item) =>
          item.tenantId === tenant.id && item.type === "residence_registration",
      );
      const registrationDueDate = registration?.dueDate ?? tenant.contractEnd;
      const daysToExpiry = dayjs(registrationDueDate, DATE_FORMAT)
        .startOf("day")
        .diff(dayjs(today).startOf("day"), "day");

      return {
        tenantId: tenant.id,
        tenantName: tenant.name,
        buildingId: tenant.buildingId,
        room: tenant.room,
        notificationStatus:
          notification?.status === "completed" ? "sent" : "not_sent",
        notificationDate: notification?.completedDate,
        referenceNumber: notification?.referenceNumber,
        // Ticket #188 — never read `registration.status`: it is not saved
        // for Đăng ký tạm trú at all, purely suy from the due date.
        registrationStatus: daysToExpiry < 0 ? "overdue" : "pending",
        registrationDueDate,
        registrationExpiringSoon:
          daysToExpiry >= 0 &&
          daysToExpiry <= RESIDENCE_REGISTRATION_EXPIRING_WINDOW_DAYS,
      };
    });
}
