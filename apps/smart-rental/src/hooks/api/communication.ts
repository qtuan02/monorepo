import type { UseQueryResult } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";

import type { UseQueryOptionsWrapper } from "~/libs/query-key-factory";
import type { NotificationTemplate, SendLog } from "~/types/communication";
import {
  mockNotificationTemplates,
  mockSendLogs,
} from "~/constants/mock/communications";
import { queryKeysFactory } from "~/libs/query-key-factory";

const notificationTemplateQueryKeyFactory = queryKeysFactory(
  "notificationTemplate",
);
const sendLogQueryKeyFactory = queryKeysFactory("sendLog");

export const notificationTemplateQueryKeys = {
  ...notificationTemplateQueryKeyFactory,
  getNotificationTemplates: () => notificationTemplateQueryKeyFactory.list(),
};

export const sendLogQueryKeys = {
  ...sendLogQueryKeyFactory,
  getSendLogs: () => sendLogQueryKeyFactory.list(),
};

export function useGetNotificationTemplates(
  options?: UseQueryOptionsWrapper<NotificationTemplate[]>,
): UseQueryResult<NotificationTemplate[], Error> {
  return useQuery<NotificationTemplate[], Error>({
    queryKey: notificationTemplateQueryKeys.getNotificationTemplates(),
    queryFn: async () => [...mockNotificationTemplates],
    ...options,
  });
}

export function useGetSendLogs(
  options?: UseQueryOptionsWrapper<SendLog[]>,
): UseQueryResult<SendLog[], Error> {
  return useQuery<SendLog[], Error>({
    queryKey: sendLogQueryKeys.getSendLogs(),
    queryFn: async () => [...mockSendLogs],
    ...options,
  });
}
