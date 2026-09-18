import type { UseQueryResult } from "@tanstack/react-query";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type {
  UseMutationOptionsWrapper,
  UseQueryOptionsWrapper,
} from "~/libs/query-key-factory";
import type { LandlordProfile } from "~/types/setting";
import { resetMockBuildings } from "~/constants/mock/buildings";
import {
  resetMockNotificationTemplates,
  resetMockSendLogs,
} from "~/constants/mock/communications";
import { resetMockComplianceItems } from "~/constants/mock/compliance";
import { resetMockContracts } from "~/constants/mock/contracts";
import { resetMockExpenses } from "~/constants/mock/expenses";
import {
  resetMockBatchInvoiceItems,
  resetMockInvoices,
} from "~/constants/mock/invoices";
import { resetMockRooms } from "~/constants/mock/rooms";
import { mockLandlordProfile } from "~/constants/mock/settings";
import { resetMockSupplierBills } from "~/constants/mock/supplier-bills";
import { resetMockTenants } from "~/constants/mock/tenants";
import { resetMockUtilities } from "~/constants/mock/utilities";
import { queryKeysFactory } from "~/libs/query-key-factory";

const settingQueryKeyFactory = queryKeysFactory("setting");

export const settingQueryKeys = {
  ...settingQueryKeyFactory,
  getLandlordProfile: () => settingQueryKeyFactory.detail("landlord-profile"),
};

export function useGetLandlordProfile(
  options?: UseQueryOptionsWrapper<LandlordProfile>,
): UseQueryResult<LandlordProfile, Error> {
  return useQuery<LandlordProfile, Error>({
    queryKey: settingQueryKeys.getLandlordProfile(),
    queryFn: async () => ({ ...mockLandlordProfile }),
    ...options,
  });
}

/**
 * "Khôi phục dữ liệu mẫu" (spec #153 §10 row 32) — every Mock this app reads
 * or writes, back to what its own module first loaded with. Every array is
 * reset in place (`trackMockReset`), so it never invalidates a single query
 * key on its own: the caller clears the whole cache instead.
 */
export function useResetMockData(options?: UseMutationOptionsWrapper<void>) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      resetMockBuildings();
      resetMockRooms();
      resetMockTenants();
      resetMockContracts();
      resetMockInvoices();
      resetMockBatchInvoiceItems();
      resetMockUtilities();
      resetMockExpenses();
      resetMockSupplierBills();
      resetMockComplianceItems();
      resetMockNotificationTemplates();
      resetMockSendLogs();
    },
    onSuccess: () => queryClient.invalidateQueries(),
    ...options,
  });
}
