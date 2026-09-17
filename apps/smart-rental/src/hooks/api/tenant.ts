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
} from "~/types/tenant";
import { mockTenants, pickAvatarColor } from "~/constants/mock/tenants";
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

export function useGetTenants(
  params?: TenantListParams,
  options?: UseQueryOptionsWrapper<Tenant[]>,
): UseQueryResult<Tenant[], Error> {
  return useQuery<Tenant[], Error>({
    queryKey: tenantQueryKeys.getTenants(params),
    queryFn: async () =>
      mockTenants.filter(
        (tenant) =>
          !params?.buildingId || tenant.buildingId === params.buildingId,
      ),
    ...options,
  });
}

export function useGetTenant(
  tenantId: string,
  options?: UseQueryOptionsWrapper<Tenant | null>,
): UseQueryResult<Tenant | null, Error> {
  return useQuery<Tenant | null, Error>({
    queryKey: tenantQueryKeys.getTenant(tenantId),
    queryFn: async () =>
      mockTenants.find((tenant) => tenant.id === tenantId) ?? null,
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
        buildingId: request.buildingId,
        name: request.fullName,
        phone: request.phone,
        email: request.email,
        room: "—",
        floor: 0,
        rentAmount: 0,
        depositAmount: 0,
        moveInDate: formatDate(new Date()),
        contractEnd: "—",
        status: "pending",
        idNumber: request.idCard,
        gender: "male",
        avatarColor: pickAvatarColor(mockTenants.length),
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
