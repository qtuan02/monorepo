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
import { mockContracts } from "~/constants/mock/contracts";
import { mockInvoices } from "~/constants/mock/invoices";
import { mockTenants } from "~/constants/mock/tenants";
import { queryKeysFactory } from "~/libs/query-key-factory";
import { formatDate } from "~/utils/date";
import { toTenantView } from "~/utils/tenant-status";

// The `building.ts` shape (spec #127): keys from the factory, a `queryFn` that
// answers with the Mock. Wiring `be-motel` later is swapping those lines for a
// service singleton from `~/libs/http-client`.
const tenantQueryKeyFactory = queryKeysFactory("tenant");

export const tenantQueryKeys = {
  ...tenantQueryKeyFactory,
  getTenants: (params?: TenantListParams) => tenantQueryKeyFactory.list(params),
  getTenant: (tenantId: string) => tenantQueryKeyFactory.detail(tenantId),
};

function withStatus(tenant: Tenant): TenantView {
  return toTenantView(tenant, mockContracts, mockInvoices);
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
  return useMutation({
    // Prepends to the Mock as the building mutation does. A fresh Người thuê
    // has no Phòng or Hợp đồng yet, so those fields are the "chờ vào" blanks.
    mutationFn: async (request: CreateTenantRequest) => {
      const tenant: Tenant = {
        id: `T${String(mockTenants.length + 1).padStart(3, "0")}`,
        buildingId: request.buildingId ?? mockBuildings[0]?.id ?? "b1",
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
