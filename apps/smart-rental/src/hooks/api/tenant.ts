import type { UseQueryResult } from "@tanstack/react-query";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type {
  UseMutationOptionsWrapper,
  UseQueryOptionsWrapper,
} from "~/libs/query-key-factory";
import type {
  CreateTenantRequest,
  Tenant,
  TenantListParams,
  TenantView,
} from "~/types/tenant";
import { mockBuildings } from "~/constants/mock/buildings";
import { mockContracts } from "~/constants/mock/contracts";
import { mockTenants } from "~/constants/mock/tenants";
import { queryKeysFactory } from "~/libs/query-key-factory";
import { formatDate } from "~/utils/date";

// The `building.ts` shape (spec #127): keys from the factory, a `queryFn` that
// answers with the Mock. Wiring `be-motel` later is swapping those lines for a
// service singleton from `~/libs/http-client`.
const tenantQueryKeyFactory = queryKeysFactory("tenant");

export const tenantQueryKeys = {
  ...tenantQueryKeyFactory,
  getTenants: (params?: TenantListParams) => tenantQueryKeyFactory.list(params),
  getTenant: (tenantId: string) => tenantQueryKeyFactory.detail(tenantId),
};

/**
 * A Người thuê has no stored status (ADR-0012) — this is the temporary,
 * hook-computed stand-in old screens still read: an `ACTIVE`/`EXPIRING`
 * Hợp đồng means "Đang thuê", anything else (or none) means "Đã rời". The
 * real derivation — folding in an overdue-Hoá-đơn flag — is a later ticket.
 */
function withStatus(tenant: Tenant): TenantView {
  const hasLiveContract = mockContracts.some(
    (contract) =>
      contract.tenantId === tenant.id &&
      (contract.status === "ACTIVE" || contract.status === "EXPIRING"),
  );
  return { ...tenant, status: hasLiveContract ? "active" : "ended" };
}

export function useGetTenants(
  params?: TenantListParams,
  options?: UseQueryOptionsWrapper<TenantView[]>,
): UseQueryResult<TenantView[], Error> {
  return useQuery<TenantView[], Error>({
    queryKey: tenantQueryKeys.getTenants(params),
    queryFn: async () =>
      mockTenants
        .filter(
          (tenant) =>
            !params?.buildingId || tenant.buildingId === params.buildingId,
        )
        .map(withStatus),
    ...options,
  });
}

export function useGetTenant(
  tenantId: string,
  options?: UseQueryOptionsWrapper<TenantView | null>,
): UseQueryResult<TenantView | null, Error> {
  return useQuery<TenantView | null, Error>({
    queryKey: tenantQueryKeys.getTenant(tenantId),
    queryFn: async () => {
      const tenant = mockTenants.find((item) => item.id === tenantId);
      return tenant ? withStatus(tenant) : null;
    },
    ...options,
  });
}

export function useCreateTenant(
  options?: UseMutationOptionsWrapper<CreateTenantRequest, Tenant>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    // Prepends to the Mock as the building mutation does. A fresh Người thuê
    // has no Phòng or Hợp đồng yet, so those fields are the "chờ vào" blanks.
    mutationFn: async (request: CreateTenantRequest) => {
      const tenant: Tenant = {
        id: `T${String(mockTenants.length + 1).padStart(3, "0")}`,
        buildingId: request.buildingId ?? (mockBuildings[0]?.id ?? "b1"),
        name: request.fullName,
        phone: request.phone,
        email: request.email,
        room: "—",
        floor: 0,
        rentAmount: 0,
        depositAmount: 0,
        moveInDate: formatDate(new Date()),
        contractEnd: "—",
        idNumber: request.idCard,
        gender: "male",
      };
      mockTenants.unshift(tenant);
      return tenant;
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: tenantQueryKeys.lists() }),
    ...options,
  });
}

export function useDeleteTenant(options?: UseMutationOptionsWrapper<string>) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (tenantId: string) => {
      const index = mockTenants.findIndex((tenant) => tenant.id === tenantId);
      if (index !== -1) mockTenants.splice(index, 1);
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: tenantQueryKeys.all }),
    ...options,
  });
}
