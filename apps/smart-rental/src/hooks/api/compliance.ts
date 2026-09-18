import type { UseQueryResult } from "@tanstack/react-query";
import { useMutation, useQuery } from "@tanstack/react-query";

import type {
  UseMutationOptionsWrapper,
  UseQueryOptionsWrapper,
} from "~/libs/query-key-factory";
import type {
  ComplianceListParams,
  ResidenceDeclaration,
} from "~/types/compliance";
import { mockComplianceItems } from "~/constants/mock/compliance";
import { mockTenants } from "~/constants/mock/tenants";
import { readWorld } from "~/libs/mock-world";
import { queryKeysFactory } from "~/libs/query-key-factory";

// The `building.ts` shape (spec #127): keys from the factory, a `queryFn`
// that answers through `readWorld` (ADR-0015) — its `residenceDeclarations`
// is already the derived `ResidenceDeclaration`, one per tenant with a live
// Hợp đồng (ticket #161, ADR-0012).
const complianceQueryKeyFactory = queryKeysFactory("compliance");

export const complianceQueryKeys = {
  ...complianceQueryKeyFactory,
  getResidenceDeclarations: (params?: ComplianceListParams) =>
    complianceQueryKeyFactory.list(params),
};

export function useGetResidenceDeclarations(
  params?: ComplianceListParams,
  options?: UseQueryOptionsWrapper<ResidenceDeclaration[]>,
): UseQueryResult<ResidenceDeclaration[], Error> {
  return useQuery<ResidenceDeclaration[], Error>({
    queryKey: complianceQueryKeys.getResidenceDeclarations(params),
    queryFn: async () =>
      readWorld(params?.buildingId ?? null).residenceDeclarations,
    ...options,
  });
}

interface MarkResidenceNotificationSentRequest {
  tenantId: string;
  /** Mã hồ sơ Cổng DVC — typed by the landlord, never auto-generated (ticket #188). */
  referenceNumber: string;
  /** Already display-formatted (`DD/MM/YYYY`). */
  sentDate: string;
}

/**
 * "Đã gửi" sheet (spec #153 §10 row 8, ticket #188): flips or creates the
 * tenant's own Thông báo lưu trú item to `completed`, with the mã hồ sơ +
 * ngày the landlord entered — never a made-up reference number. The matching
 * task drops off Hôm nay's Việc cần làm on the next read (ticket #161 AC,
 * ADR-0015 §3).
 */
export function useMarkResidenceNotificationSent(
  options?: UseMutationOptionsWrapper<
    MarkResidenceNotificationSentRequest,
    void
  >,
) {
  return useMutation({
    mutationFn: async ({
      tenantId,
      referenceNumber,
      sentDate,
    }: MarkResidenceNotificationSentRequest) => {
      const existing = mockComplianceItems.find(
        (item) =>
          item.tenantId === tenantId && item.type === "residence_notification",
      );

      if (existing) {
        existing.status = "completed";
        existing.completedDate = sentDate;
        existing.referenceNumber = referenceNumber;
        return;
      }

      const tenant = mockTenants.find((item) => item.id === tenantId);
      mockComplianceItems.push({
        id: `RN-${tenantId}`,
        buildingId: tenant?.buildingId ?? "",
        tenantId,
        tenant: tenant?.name ?? "",
        room: tenant?.room ?? "",
        type: "residence_notification",
        status: "completed",
        dueDate: sentDate,
        completedDate: sentDate,
        referenceNumber,
      });
    },
    ...options,
  });
}

interface ExtendResidenceRegistrationRequest {
  tenantId: string;
  /** Already display-formatted (`DD/MM/YYYY`). */
  newDueDate: string;
}

/**
 * "Đã gia hạn đến …" (ticket #188): the one write Đăng ký tạm trú has — it
 * only ever moves `dueDate` out, since `registrationStatus` itself is never
 * stored (see `~/utils/residence-declaration`).
 */
export function useExtendResidenceRegistration(
  options?: UseMutationOptionsWrapper<ExtendResidenceRegistrationRequest, void>,
) {
  return useMutation({
    mutationFn: async ({
      tenantId,
      newDueDate,
    }: ExtendResidenceRegistrationRequest) => {
      const existing = mockComplianceItems.find(
        (item) =>
          item.tenantId === tenantId && item.type === "residence_registration",
      );

      if (existing) {
        existing.dueDate = newDueDate;
        return;
      }

      const tenant = mockTenants.find((item) => item.id === tenantId);
      mockComplianceItems.push({
        id: `RR-${tenantId}`,
        buildingId: tenant?.buildingId ?? "",
        tenantId,
        tenant: tenant?.name ?? "",
        room: tenant?.room ?? "",
        type: "residence_registration",
        status: "pending",
        dueDate: newDueDate,
      });
    },
    ...options,
  });
}
