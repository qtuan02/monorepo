import type { ComplianceItem } from "~/types/compliance";
import { mockContracts } from "~/constants/mock/contracts";
import { mockTenants } from "~/constants/mock/tenants";
import { trackMockReset } from "~/utils/mock-reset";

/**
 * The Mock every Khai báo lưu trú read comes from (ADR-0012, spec #153) —
 * two kinds per Người thuê: Thông báo lưu trú (the landlord's duty) and Đăng
 * ký tạm trú (the tenant's). `T005` (Hoàng Văn E) deliberately has no Thông
 * báo lưu trú record at all — spec #153's "≥ 1 Người thuê chưa có Thông báo
 * lưu trú", which is how it reaches Việc cần làm in a later ticket.
 *
 * `room`/`moveInDate`/`contractEnd` read off the tenant's matching record in
 * `mock/contracts.ts` (ADR-0015 §2 — `Tenant` itself carries neither any
 * more), the same one-per-occupied-Phòng authoring that file's own note
 * describes.
 */
export const mockComplianceItems: ComplianceItem[] = mockTenants.flatMap(
  (tenant, index) => {
    const contract = mockContracts.find((c) => c.tenantId === tenant.id);
    const room = contract?.room ?? "—";
    const moveInDate = contract?.startDate ?? "—";
    const contractEnd = contract?.endDate ?? "—";
    const items: ComplianceItem[] = [];

    if (tenant.id !== "T005") {
      items.push({
        id: `RN-${tenant.id}`,
        buildingId: tenant.buildingId,
        tenantId: tenant.id,
        tenant: tenant.name,
        room,
        type: "residence_notification",
        status: "completed",
        dueDate: moveInDate,
        completedDate: moveInDate,
        referenceNumber: `CT01-${String(index + 1).padStart(4, "0")}`,
      });
    }

    items.push({
      id: `RR-${tenant.id}`,
      buildingId: tenant.buildingId,
      tenantId: tenant.id,
      tenant: tenant.name,
      room,
      type: "residence_registration",
      // `status` is unused for this type (ticket #188) — registrationStatus
      // is suy purely from `dueDate` in `~/utils/residence-declaration`.
      status: "pending",
      dueDate: contractEnd,
    });

    return items;
  },
);

export const resetMockComplianceItems = trackMockReset(mockComplianceItems);
