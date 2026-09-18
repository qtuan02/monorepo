import { useMutation } from "@tanstack/react-query";

import type {
  ChatSignInPayload,
  ChatSignUpPayload,
} from "@monorepo/types/chat-auth";

import type { UseMutationOptionsWrapper } from "~/libs/query-key-factory";
import { chatAuthService } from "~/libs/http-client";

// No `onError` toast here — the global `MutationCache.onError` in
// ~/libs/query-client.ts already surfaces every failed mutation once.

export function useSignInMutation(
  options?: UseMutationOptionsWrapper<ChatSignInPayload, string>,
) {
  return useMutation({
    mutationFn: (payload: ChatSignInPayload) => chatAuthService.signIn(payload),
    ...options,
  });
}

export function useSignUpMutation(
  options?: UseMutationOptionsWrapper<ChatSignUpPayload, void>,
) {
  return useMutation({
    mutationFn: (payload: ChatSignUpPayload) => chatAuthService.signUp(payload),
    ...options,
  });
}

export function useSignOutMutation(
  options?: UseMutationOptionsWrapper<void, void>,
) {
  return useMutation({
    mutationFn: () => chatAuthService.signOut(),
    ...options,
  });
}
