import type { UseQueryResult } from "@tanstack/react-query";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type {
  UseMutationOptionsWrapper,
  UseQueryOptionsWrapper,
} from "~/libs/query-key-factory";
import type { ElectricityTierConfig, Setting } from "~/types/setting";
import {
  mockElectricityTierConfig,
  mockSettings,
} from "~/constants/mock/settings";
import { queryKeysFactory } from "~/libs/query-key-factory";

const settingQueryKeyFactory = queryKeysFactory("setting");

export const settingQueryKeys = {
  ...settingQueryKeyFactory,
  getSettings: () => settingQueryKeyFactory.list(),
  getElectricityTierConfig: () =>
    settingQueryKeyFactory.detail("electricity-tiers"),
};

export function useGetSettings(
  options?: UseQueryOptionsWrapper<Setting[]>,
): UseQueryResult<Setting[], Error> {
  return useQuery<Setting[], Error>({
    queryKey: settingQueryKeys.getSettings(),
    queryFn: async () => [...mockSettings],
    ...options,
  });
}

export function useGetElectricityTierConfig(
  options?: UseQueryOptionsWrapper<ElectricityTierConfig>,
): UseQueryResult<ElectricityTierConfig, Error> {
  return useQuery<ElectricityTierConfig, Error>({
    queryKey: settingQueryKeys.getElectricityTierConfig(),
    // A deep copy, so a form editing the result never edits the Mock in place.
    queryFn: async () => structuredClone(mockElectricityTierConfig),
    ...options,
  });
}

export function useUpdateElectricityTierConfig(
  options?: UseMutationOptionsWrapper<ElectricityTierConfig>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (config: ElectricityTierConfig) => {
      Object.assign(mockElectricityTierConfig, structuredClone(config));
    },
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: settingQueryKeys.getElectricityTierConfig(),
      }),
    ...options,
  });
}
