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
import type {
  ChatConversationRecord,
  ChatCreateGroupParams,
  ChatGroupMembersParams,
  ChatUpdateGroupParams,
} from "@monorepo/types/chat-conversation";
import type {
  ChatConversationSeenEvent,
  ChatConversationUpdatedEvent,
} from "@monorepo/types/chat-socket";
import { ChatConversationType } from "@monorepo/types/chat-conversation";
import { toast } from "@monorepo/ui/components/toast";

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

/**
 * `type` is undefined for the default (all-conversations) list and `GROUP`
 * for the list's "Groups" chip — passed to the key factory's own `query`
 * slot so the two live under distinct cache entries (T2, brief §10 row 15):
 * a group's row loaded only through the Groups chip must not be mistaken
 * for a page of the default list, and invalidating one must not silently
 * refetch the other under a shared key.
 */
export function useConversationsInfiniteQuery(
  type?: ChatConversationType,
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
    queryKey: conversationQueryKeys.list(type ? { type } : undefined),
    queryFn: ({ pageParam }) =>
      chatConversationService.getConversations({
        limit: CONVERSATIONS_PAGE_LIMIT,
        cursor: pageParam,
        type,
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

// The four group writes below all invalidate the whole conversation list
// rather than patching one record in place — unlike the socket-driven
// helpers above, each already holds the full updated record from its own
// response, but a group write also changes `participants`, which several
// other cached reads (the details panel, the member picker's disabled set)
// derive from — see .agents/rules/tanstack-consume-mutation.md.

export function useCreateGroupMutation(
  options?: UseMutationOptionsWrapper<
    ChatCreateGroupParams,
    ChatConversationRecord
  >,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: ChatCreateGroupParams) =>
      chatConversationService.createGroup(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: conversationQueryKeys.all });
      toast.add({ title: "Group created.", type: "success" });
    },
    ...options,
  });
}

export function useUpdateGroupMutation(
  options?: UseMutationOptionsWrapper<
    { conversationId: string; params: ChatUpdateGroupParams },
    ChatConversationRecord
  >,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      conversationId,
      params,
    }: {
      conversationId: string;
      params: ChatUpdateGroupParams;
    }) => chatConversationService.updateGroup(conversationId, params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: conversationQueryKeys.all });
      toast.add({ title: "Group name updated.", type: "success" });
    },
    ...options,
  });
}

export function useAddGroupMembersMutation(
  options?: UseMutationOptionsWrapper<
    { conversationId: string; params: ChatGroupMembersParams },
    ChatConversationRecord
  >,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      conversationId,
      params,
    }: {
      conversationId: string;
      params: ChatGroupMembersParams;
    }) => chatConversationService.addMembers(conversationId, params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: conversationQueryKeys.all });
      toast.add({ title: "Members added.", type: "success" });
    },
    ...options,
  });
}

export function useRemoveGroupMemberMutation(
  options?: UseMutationOptionsWrapper<
    { conversationId: string; memberId: string },
    ChatConversationRecord
  >,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      conversationId,
      memberId,
    }: {
      conversationId: string;
      memberId: string;
    }) => chatConversationService.removeMember(conversationId, memberId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: conversationQueryKeys.all });
      toast.add({ title: "Member removed.", type: "success" });
    },
    ...options,
  });
}

export function useLeaveGroupMutation(
  options?: UseMutationOptionsWrapper<string, void>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (conversationId: string) =>
      chatConversationService.leave(conversationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: conversationQueryKeys.all });
      toast.add({ title: "You left the group.", type: "success" });
    },
    ...options,
  });
}
