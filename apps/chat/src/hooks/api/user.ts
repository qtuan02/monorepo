import { useQuery } from "@tanstack/react-query";

import type { ChatUserProfile } from "@monorepo/types/chat-user";

import type { UseQueryOptionsWrapper } from "~/libs/query-key-factory";
import { chatUserService } from "~/libs/http-client";
import { queryKeysFactory } from "~/libs/query-key-factory";
import { useAuthStore } from "~/stores/use-auth-store";

const userQueryKeyFactory = queryKeysFactory("user");

export const userQueryKeys = {
  ...userQueryKeyFactory,
  current: () => userQueryKeyFactory.detail("me"),
};

export function useCurrentUserQuery(
  options?: UseQueryOptionsWrapper<ChatUserProfile>,
) {
  const token = useAuthStore((state) => state.token);

  return useQuery<ChatUserProfile, Error>({
    queryKey: userQueryKeys.current(),
    queryFn: chatUserService.me,
    enabled: !!token && (options?.enabled ?? true),
    ...options,
  });
}
