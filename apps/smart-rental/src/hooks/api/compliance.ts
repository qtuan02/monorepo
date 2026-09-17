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
import { formatDate } from "~/utils/date";
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
}

/**
 * "Nút Đã gửi ghi tay" (spec #153 §10 row 8): flips or creates the tenant's
 * own Thông báo lưu trú item to `completed`. Invalidates Việc cần làm too —
 * that is what makes the matching task disappear from Hôm nay (ticket #161 AC).
 */
export function useMarkResidenceNotificationSent(
  options?: UseMutationOptionsWrapper<
    MarkResidenceNotificationSentRequest,
    void
  >,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ tenantId }: MarkResidenceNotificationSentRequest) => {
      const today = formatDate(new Date());
      const existing = mockComplianceItems.find(
        (item) =>
          item.tenantId === tenantId && item.type === "residence_notification",
      );

      if (existing) {
        existing.status = "completed";
        existing.completedDate = today;
        existing.referenceNumber ??= `CT01-${tenantId}`;
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
        dueDate: today,
        completedDate: today,
        referenceNumber: `CT01-${tenantId}`,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: complianceQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: taskQueryKeys.all });
    },
    ...options,
  });
}
