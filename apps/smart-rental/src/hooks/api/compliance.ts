import type { UseQueryResult } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";

import type { UseQueryOptionsWrapper } from "~/libs/query-key-factory";
import type { ComplianceItem } from "~/types/compliance";
import { mockComplianceItems } from "~/constants/mock/compliance";
import { queryKeysFactory } from "~/libs/query-key-factory";

const complianceQueryKeyFactory = queryKeysFactory("compliance");

export const complianceQueryKeys = {
  ...complianceQueryKeyFactory,
  getComplianceItems: () => complianceQueryKeyFactory.list(),
};

export function useGetComplianceItems(
  options?: UseQueryOptionsWrapper<ComplianceItem[]>,
): UseQueryResult<ComplianceItem[], Error> {
  return useQuery<ComplianceItem[], Error>({
    queryKey: complianceQueryKeys.getComplianceItems(),
    queryFn: async () => [...mockComplianceItems],
    ...options,
  });
}
