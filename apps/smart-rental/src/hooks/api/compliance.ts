import type { UseQueryResult } from "@tanstack/react-query";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type {
  UseMutationOptionsWrapper,
  UseQueryOptionsWrapper,
} from "~/libs/query-key-factory";
import type {
  ComplianceListParams,
  ResidenceDeclaration,
} from "~/types/compliance";
import { mockComplianceItems } from "~/constants/mock/compliance";
import { mockContracts } from "~/constants/mock/contracts";
import { mockTenants } from "~/constants/mock/tenants";
import { taskQueryKeys } from "~/hooks/api/task";
import { queryKeysFactory } from "~/libs/query-key-factory";
import { buildResidenceDeclarations } from "~/utils/residence-declaration";

// The `building.ts` shape (spec #127): keys from the factory, a `queryFn`
// that answers with the Mock. `ComplianceItem` is no longer read directly by
// a screen (ticket #161) — every read goes through the derived
// `ResidenceDeclaration` (ADR-0012), one per tenant with a live Hợp đồng.
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
      buildResidenceDeclarations(
        params?.buildingId
          ? mockTenants.filter(
              (tenant) => tenant.buildingId === params.buildingId,
            )
          : mockTenants,
        mockContracts,
        mockComplianceItems,
      ),
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
 * ngày the landlord entered — never a made-up reference number. Invalidates
 * Việc cần làm too — that is what makes the matching task disappear from
 * Hôm nay (ticket #161 AC).
 */
export function useMarkResidenceNotificationSent(
  options?: UseMutationOptionsWrapper<
    MarkResidenceNotificationSentRequest,
    void
  >,
) {
  const queryClient = useQueryClient();

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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: complianceQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: taskQueryKeys.all });
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
 * stored (see `~/utils/residence-declaration`). Invalidates Việc cần làm too,
 * so a renewed registration drops its "sắp hết hạn" task immediately.
 */
export function useExtendResidenceRegistration(
  options?: UseMutationOptionsWrapper<ExtendResidenceRegistrationRequest, void>,
) {
  const queryClient = useQueryClient();

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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: complianceQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: taskQueryKeys.all });
    },
    ...options,
  });
}
