import type {
  InfiniteData,
  QueryClient,
  UseInfiniteQueryResult,
} from "@tanstack/react-query";
import { useCallback } from "react";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { useNavigate } from "react-router";

import type { ChatConversationPage } from "@monorepo/api/chat/conversation-service";
import type { ChatConversationRecord } from "@monorepo/types/chat-conversation";
import type {
  ChatConversationSeenEvent,
  ChatConversationUpdatedEvent,
} from "@monorepo/types/chat-socket";
import { ChatConversationType } from "@monorepo/types/chat-conversation";

import type {
  UseInfiniteQueryOptionsWrapper,
  UseMutationOptionsWrapper,
} from "~/libs/query-key-factory";
import type { DirectMessageUser } from "~/types/direct-message-user";
import { ROUTES } from "~/constants/routes";
import { chatConversationService } from "~/libs/http-client";
import { queryKeysFactory } from "~/libs/query-key-factory";

const CONVERSATIONS_PAGE_LIMIT = 20;

const conversationQueryKeyFactory = queryKeysFactory("conversation");

export const conversationQueryKeys = {
  ...conversationQueryKeyFactory,
};

type ConversationInfiniteData = InfiniteData<
  ChatConversationPage,
  string | undefined
>;

/**
 * Patches whichever page currently holds `conversationId`, in place. Not
 * "move to top": `useConversationList` already re-sorts by `lastMessageAt` on
 * every render (see use-conversation-list.ts), so updating the record where
 * it sits is enough for the sidebar to reorder itself.
 *
 * ponytail: a conversation the socket names but the list has never loaded
 * (e.g. a brand-new one from someone else) is a silent no-op here — add an
 * invalidate-on-miss fallback once conversation creation can happen without
 * a REST round trip of its own.
 */
function updateConversationInPlace(
  data: ConversationInfiniteData | undefined,
  conversationId: string,
  updater: (conversation: ChatConversationRecord) => ChatConversationRecord,
): ConversationInfiniteData | undefined {
  if (!data) return data;

  return {
    ...data,
    pages: data.pages.map((page) => ({
      ...page,
      items: page.items.map((conversation) =>
        conversation.id === conversationId
          ? updater(conversation)
          : conversation,
      ),
    })),
  };
}

interface ConversationUpdateOptions {
  /** Overrides the event's own count — used to clear it for the conversation currently open on screen. */
  unreadCount?: number;
}

/** `conversation.updated` — a new message anywhere patches the conversation's preview + unread count. */
export function applyConversationUpdateToCache(
  queryClient: QueryClient,
  event: ChatConversationUpdatedEvent,
  options: ConversationUpdateOptions = {},
) {
  queryClient.setQueriesData<ConversationInfiniteData>(
    { queryKey: conversationQueryKeys.lists() },
    (data) =>
      updateConversationInPlace(data, event.conversationId, (conversation) => ({
        ...conversation,
        lastMessage: event.lastMessage,
        lastMessageAt: event.lastMessageAt,
        unreadCount: options.unreadCount ?? event.unreadCount,
      })),
  );
}

/** `conversation.seen` — the read receipt of whoever just saw the conversation. */
export function applyConversationSeenToCache(
  queryClient: QueryClient,
  event: ChatConversationSeenEvent,
  currentUserId?: string,
) {
  queryClient.setQueriesData<ConversationInfiniteData>(
    { queryKey: conversationQueryKeys.lists() },
    (data) =>
      updateConversationInPlace(data, event.conversationId, (conversation) => ({
        ...conversation,
        unreadCount:
          event.seenByUserId === currentUserId ? 0 : conversation.unreadCount,
        participants: conversation.participants.map((participant) =>
          participant.userId === event.seenByUserId
            ? {
                ...participant,
                lastReadMessageId: event.lastReadMessageId,
                lastReadAt: event.lastReadAt,
              }
            : participant,
        ),
      })),
  );
}

export function useMarkConversationAsSeenMutation(
  options?: UseMutationOptionsWrapper<string, void>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (conversationId: string) =>
      chatConversationService.markAsSeen(conversationId),
    onSuccess: (_data, conversationId) => {
      queryClient.setQueriesData<ConversationInfiniteData>(
        { queryKey: conversationQueryKeys.lists() },
        (data) =>
          updateConversationInPlace(data, conversationId, (conversation) => ({
            ...conversation,
            unreadCount: 0,
          })),
      );
    },
    ...options,
  });
}

export function useConversationsInfiniteQuery(
  options?: UseInfiniteQueryOptionsWrapper<
    ChatConversationPage,
    Error,
    ChatConversationRecord[],
    readonly unknown[],
    string | undefined
  >,
): UseInfiniteQueryResult<ChatConversationRecord[], Error> {
  return useInfiniteQuery<
    ChatConversationPage,
    Error,
    ChatConversationRecord[],
    readonly unknown[],
    string | undefined
  >({
    queryKey: conversationQueryKeys.list(),
    queryFn: ({ pageParam }) =>
      chatConversationService.getConversations({
        limit: CONVERSATIONS_PAGE_LIMIT,
        cursor: pageParam,
      }),
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    initialPageParam: undefined,
    // Flattened here, not by the caller — see .agents/rules/tanstack-consume-infinite.md.
    select: (data) => data.pages.flatMap((page) => page.items),
    ...options,
  });
}

/**
 * The "message this person" jump: if a DIRECT conversation with them already
 * exists, go straight there; otherwise land on Home with the person in
 * router state, which `useDirectMessageDraft` (conversation feature) reads
 * to open a Draft conversation (see apps/chat/CONTEXT.md). Lives here, not
 * inside the `conversation` feature, so `friends` — a sibling feature — can
 * call it without reaching into another slice's internals (see
 * .agents/rules/architecture-feature-boundaries.md).
 */
export function useOpenDirectConversation() {
  const navigate = useNavigate();
  const conversationsQuery = useConversationsInfiniteQuery();

  return useCallback(
    (user: DirectMessageUser) => {
      const existing = (conversationsQuery.data ?? []).find(
        (conversation) =>
          conversation.type === ChatConversationType.DIRECT &&
          conversation.participants.some(
            (participant) => participant.userId === user.id,
          ),
      );

      if (existing) {
        navigate(ROUTES.conversationByIdPath(existing.id));
        return;
      }

      navigate(ROUTES.HOME, { state: { directMessageDraftUser: user } });
    },
    [conversationsQuery.data, navigate],
  );
}
