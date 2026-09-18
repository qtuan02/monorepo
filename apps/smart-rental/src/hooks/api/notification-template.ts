import type { UseQueryResult } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";

import type { UseQueryOptionsWrapper } from "~/libs/query-key-factory";
import type { NotificationTemplate } from "~/types/communication";
import { readWorld } from "~/libs/mock-world";
import { queryKeysFactory } from "~/libs/query-key-factory";

const notificationTemplateQueryKeyFactory = queryKeysFactory(
  "notificationTemplate",
);

export const notificationTemplateQueryKeys = {
  ...notificationTemplateQueryKeyFactory,
  getNotificationTemplates: () => notificationTemplateQueryKeyFactory.list(),
};

export function useGetNotificationTemplates(
  options?: UseQueryOptionsWrapper<NotificationTemplate[]>,
): UseQueryResult<NotificationTemplate[], Error> {
  return useQuery<NotificationTemplate[], Error>({
    queryKey: notificationTemplateQueryKeys.getNotificationTemplates(),
    queryFn: async () => readWorld(null).notificationTemplates,
    ...options,
  });
}
