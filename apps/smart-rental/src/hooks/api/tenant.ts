import type { UseQueryResult } from "@tanstack/react-query";
import { useMutation, useQuery } from "@tanstack/react-query";

import { HttpError } from "@monorepo/api/client";

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
import { mockTenants } from "~/constants/mock/tenants";
import { readWorld } from "~/libs/mock-world";
import { queryKeysFactory } from "~/libs/query-key-factory";

// The `building.ts` shape (spec #127): keys from the factory, a `queryFn` that
// answers through `readWorld` (ADR-0015). Wiring `be-motel` later is swapping
// that one line for a service singleton from `~/libs/http-client`.
const tenantQueryKeyFactory = queryKeysFactory("tenant");

export const tenantQueryKeys = {
  ...tenantQueryKeyFactory,
  getTenants: (params?: TenantListParams) => tenantQueryKeyFactory.list(params),
  getTenant: (tenantId: string) => tenantQueryKeyFactory.detail(tenantId),
};

export function useGetTenants(
  params?: TenantListParams,
  options?: UseQueryOptionsWrapper<TenantView[]>,
): UseQueryResult<TenantView[], Error> {
  return useQuery<TenantView[], Error>({
    queryKey: tenantQueryKeys.getTenants(params),
    queryFn: async () => readWorld(params?.buildingId ?? null).tenants,
    ...options,
  });
}

export function useGetTenant(
  tenantId: string,
  options?: UseQueryOptionsWrapper<TenantView | null>,
): UseQueryResult<TenantView | null, Error> {
  return useQuery<TenantView | null, Error>({
    queryKey: tenantQueryKeys.getTenant(tenantId),
    queryFn: async () =>
      readWorld(null).tenants.find((item) => item.id === tenantId) ?? null,
    ...options,
  });
}

export function useCreateTenant(
  options?: UseMutationOptionsWrapper<CreateTenantRequest, Tenant>,
) {
  return useMutation({
    // Prepends to the Mock as the building mutation does. A fresh Người thuê
    // has no Phòng or Hợp đồng yet — World's `room`/`floor`/… fall back to
    // their own "chờ vào" blanks until one exists (ADR-0015 §2).
    mutationFn: async (request: CreateTenantRequest) => {
      const tenant: Tenant = {
        id: `T${String(mockTenants.length + 1).padStart(3, "0")}`,
        buildingId: request.buildingId ?? mockBuildings[0]?.id ?? "b1",
        name: request.fullName,
        phone: request.phone,
        email: request.email,
        idNumber: request.idCard,
        gender: "male",
      };
      mockTenants.unshift(tenant);
      return tenant;
    },
    ...options,
  });
}

interface UpdateTenantRequest {
  tenantId: string;
  payload: CreateTenantRequest;
}

/**
 * "Sửa trong FormSheet" (spec #153 §10 row 15, ticket #161) — the same four
 * fields the Mock actually persists (`fullName`/`idCard`/`phone`/`email`);
 * `dob`/`hometown`/`vehicleType`/`vehiclePlate` are captured but, as in
 * `useCreateTenant`, have no Tenant field of their own to write into.
 */
export function useUpdateTenant(
  options?: UseMutationOptionsWrapper<UpdateTenantRequest, Tenant>,
) {
  return useMutation({
    mutationFn: async ({ tenantId, payload }: UpdateTenantRequest) => {
      const index = mockTenants.findIndex((tenant) => tenant.id === tenantId);
      if (index === -1) {
        throw new HttpError({
          statusCode: 404,
          message: `Không tìm thấy Người thuê ${tenantId}`,
        });
      }

      const updated: Tenant = {
        ...(mockTenants[index] as Tenant),
        name: payload.fullName,
        idNumber: payload.idCard,
        phone: payload.phone,
        email: payload.email,
      };
      mockTenants[index] = updated;
      return updated;
    },
    ...options,
  });
}

export function useDeleteTenant(options?: UseMutationOptionsWrapper<string>) {
  return useMutation({
    mutationFn: async (tenantId: string) => {
      const index = mockTenants.findIndex((tenant) => tenant.id === tenantId);
      if (index !== -1) mockTenants.splice(index, 1);
    },
    ...options,
  });
}
